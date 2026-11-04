const fs = require('fs');
const pdfParse = require('pdf-parse');
const db = require('../config/db');

class DocumentRepository {
  static async create({ title, fileReference, uploaderId, sourceLabel }) {
    const query = `
      INSERT INTO documents (title, file_reference, uploader_id, status, source_label)
      VALUES ($1, $2, $3, 'processing', $4)
      RETURNING document_id, title, status, uploaded_at
    `;
    const result = await db.query(query, [title, fileReference, uploaderId, sourceLabel]);
    return result.rows[0];
  }

  static async findVisibleToUser(userId, role) {
    if (role === 'admin') {
      const result = await db.query(`SELECT d.*, u.name as uploader_name FROM documents d LEFT JOIN users u ON d.uploader_id = u.user_id ORDER BY d.uploaded_at DESC`);
      return result.rows;
    } else {
      const query = `
        SELECT DISTINCT d.*, u.name as uploader_name
        FROM documents d
        LEFT JOIN users u ON d.uploader_id = u.user_id
        JOIN document_permissions dp ON d.document_id = dp.document_id
        WHERE dp.user_id = $1 OR d.uploader_id = $1
        ORDER BY d.uploaded_at DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    }
  }

  static async updateStatus(documentId, status) {
    await db.query(`UPDATE documents SET status = $1 WHERE document_id = $2`, [status, documentId]);
  }

  static async saveChunks(documentId, chunks) {
    for (const chunk of chunks) {
      const query = `
        INSERT INTO document_chunks (document_id, chunk_index, extracted_text, page_number, embedding, evidence_status)
        VALUES ($1, $2, $3, $4, $5::vector, 'normal')
      `;
      // For prototype without active Ollama container running yet, store zero vector or mock embedding if needed
      const vectorLiteral = `[${chunk.embedding.join(',')}]`;
      await db.query(query, [documentId, chunk.index, chunk.text, chunk.pageNumber || null, vectorLiteral]);
    }
  }
}

class DocumentService {
  static async processDocument(documentId, filePath, title, uploaderId) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      let fullText = '';
      let pageNumber = 1;

      if (filePath.endsWith('.pdf')) {
        const parsed = await pdfParse(dataBuffer);
        fullText = parsed.text;
      } else {
        fullText = dataBuffer.toString('utf-8');
      }

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('Extracted text is empty');
      }

      // Simple chunking with overlap
      const chunkSize = 500;
      const chunkOverlap = 50;
      const chunks = [];
      let index = 0;

      for (let i = 0; i < fullText.length; i += (chunkSize - chunkOverlap)) {
        const textSlice = fullText.slice(i, i + chunkSize);

        // Generate mock or real embedding (768 dimensions for nomic-embed-text)
        // In local prototype without running Ollama yet, generate deterministic pseudo-random float array
        const embedding = Array.from({ length: 768 }, (_, idx) => Math.sin(idx + i) * 0.1);

        chunks.push({
          index: index++,
          text: textSlice,
          pageNumber: 1,
          embedding
        });
      }

      await DocumentRepository.saveChunks(documentId, chunks);
      await DocumentRepository.updateStatus(documentId, 'ready');

      // Audit log entry
      await db.query(
        `INSERT INTO audit_logs (actor_id, event_type, object_type, object_id, outcome, reason) VALUES ($1, 'UPLOAD', 'document', $2, 'success', 'Document processed successfully')`,
        [uploaderId, documentId]
      );

    } catch (err) {
      console.error('Document processing failed:', err);
      await DocumentRepository.updateStatus(documentId, 'failed');
      await db.query(
        `INSERT INTO audit_logs (actor_id, event_type, object_type, object_id, outcome, reason) VALUES ($1, 'UPLOAD', 'document', $2, 'failure', $3)`,
        [uploaderId, documentId, err.message]
      );
    }
  }
}

module.exports = { DocumentRepository, DocumentService };
