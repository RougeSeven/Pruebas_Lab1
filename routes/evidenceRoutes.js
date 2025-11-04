const express = require('express');
const multer = require('multer');
const Evidence = require('../models/Evidence');
const Event = require('../models/Event'); // Importa el modelo Event para buscar eventos por processId
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();

// Configuración multer para almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // carpeta uploads/
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage, limits: {
     fileSize: 8000000 // Compliant: 8MB
  } });

// 🔐 Crear evidencia (protegido)
router.post('/evidence', authenticateToken, async (req, res) => {
  try {
    const { eventId, evidenceType, evidenceName, filePath } = req.body;

    // Validar que eventId existe
    const eventExists = await Event.findOne({ eventId });
    if (!eventExists) {
      return res.status(400).json({ message: 'Evento no existe' });
    }

    // Crear nueva evidencia
    const newEvidence = new Evidence({
      eventId,
      evidenceType,
      evidenceName,
      filePath,
    });

    const saved = await newEvidence.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Obtener evidencia por evidenceId (consulta libre)
router.get('/evidence/:id', async (req, res) => {
  try {
    const ev = await Evidence.findOne({ evidenceId: req.params.id });
    if (!ev)
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    res.status(200).json(ev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Obtener evidencias por eventId (consulta libre)
router.get('/evidences/event/:eventId', async (req, res) => {
  try {
    const evidences = await Evidence.find({
      eventId: Number(req.params.eventId),
    });
    res.status(200).json(evidences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Obtener evidencias por processId (consulta libre)
// Busca eventos relacionados al proceso y luego evidencias de esos eventos
router.get('/evidences/process/:processId', async (req, res) => {
  try {
    const processId = Number(req.params.processId);
    if (Number.isNan(processId)) {
      return res.status(400).json({ message: 'processId debe ser un número' });
    }

    // Buscar eventos vinculados al processId
    const events = await Event.find({ processId });
    const eventIds = events.map((e) => e.eventId);

    // Buscar evidencias relacionadas a esos eventos
    const evidences = await Evidence.find({ eventId: { $in: eventIds } });

    res.status(200).json(evidences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Actualizar evidencia por evidenceId (protegido)
router.put('/evidence/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Evidence.findOneAndUpdate(
      { evidenceId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Eliminar evidencia por evidenceId (protegido)
router.delete('/evidence/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Evidence.deleteOne({ evidenceId: req.params.id });
    if (deleted.deletedCount === 0)
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    res.status(200).json({ message: 'Evidencia eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Subir archivo (protegido)
router.post(
  '/evidence/upload',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    try {
      res.status(200).json({ filePath: req.file.path });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
