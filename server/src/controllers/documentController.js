const { DocumentRepository, DocumentService } = require('../services/documentService');
const db = require('../config/db');

class DocumentController {
  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type (PDF/TXT only)' });
      }

      const { originalname, path: filePath } = req.file;
      const title = req.body.title || originalname;
      const uploaderId = req.user.userId;

      const doc = await DocumentRepository.create({
        title,
        fileReference: filePath,
        uploaderId,
        sourceLabel: originalname
      });

      // Grant initial read permission to the uploader
      await db.query(
        `INSERT INTO document_permissions (document_id, user_id, permission_type, granted_by) VALUES ($1, $2, 'read', $2) ON CONFLICT DO NOTHING`,
        [doc.document_id, uploaderId]
      );

      // Process document asynchronously in background
      DocumentService.processDocument(doc.document_id, filePath, title, uploaderId);

      return res.status(201).json({
        message: 'Document uploaded and processing started',
        document: doc
      });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Internal server error during upload' });
    }
  }

  static async list(req, res) {
    try {
      const documents = await DocumentRepository.findVisibleToUser(req.user.userId, req.user.role);
      return res.status(200).json({ documents });
    } catch (err) {
      console.error('List documents error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = DocumentController;
