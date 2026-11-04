const express = require('express');
const DocumentController = require('../controllers/documentController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', authenticate, requireAdmin, upload.single('file'), DocumentController.upload);
router.get('/', authenticate, DocumentController.list);

module.exports = router;
