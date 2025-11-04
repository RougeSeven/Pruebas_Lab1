const express = require('express');
const Observation = require('../models/Observation');
const { authenticateToken } = require('../middleware/authenticateToken'); // 🔐 Middleware
const router = express.Router();
const Event = require('../models/Event'); // <-- Esto es lo que falta

// 🔐 Crear una observación con validación de existencia del evento
router.post('/observation', authenticateToken, async (req, res) => {
  try {
    // ✅ Verificar si el evento existe correctamente usando el modelo Event
    const existingEvent = await Event.findOne({ eventId: req.body.eventId });
    if (!existingEvent) {
      return res.status(400).json({ message: 'Evento no existe' });
    }

    // Buscar el máximo observationId actual
    const maxObservation = await Observation.findOne()
      .sort({ observationId: -1 })
      .limit(1);
    const nextId = maxObservation ? maxObservation.observationId + 1 : 1;

    const newObservation = new Observation({
      observationId: nextId,
      title: req.body.title,
      content: req.body.content,
      eventId: req.body.eventId,
    });

    const saved = await newObservation.save();
    res.status(201).json(saved);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error al crear observación', error: err.message });
  }
});
// Listar todas las observaciones (sin orden específico, pública)
router.get('/observations', async (req, res) => {
  try {
    const list = await Observation.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Obtener una observación por observationId (consulta libre)
router.get('/observation/:id', async (req, res) => {
  try {
    const obs = await Observation.findOne({ observationId: req.params.id });
    obs ? res.status(200).json(obs) : res.status(404).json({});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Actualizar observación por observationId
router.put('/observation/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Observation.findOneAndUpdate(
      { observationId: req.params.id },
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Eliminar observación
router.delete('/observation/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Observation.deleteOne({
      observationId: req.params.id,
    });
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Listar observaciones en orden descendente
router.get('/observations/desc', async (req, res) => {
  try {
    const list = await Observation.find().sort({ observationId: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Listar observaciones en orden ascendente
router.get('/observations/asc', async (req, res) => {
  try {
    const list = await Observation.find().sort({ observationId: 1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Listar observaciones por eventId
router.get('/observations/event/:eventId', async (req, res) => {
  try {
    const list = await Observation.find({ eventId: req.params.eventId });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
