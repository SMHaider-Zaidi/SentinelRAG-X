export const documentsApi = {
  list: async (token) => {
    const res = await fetch('http://localhost:5000/api/documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch documents');
    return data.documents;
  },
  upload: async (token, formData) => {
    const res = await fetch('http://localhost:5000/api/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};
