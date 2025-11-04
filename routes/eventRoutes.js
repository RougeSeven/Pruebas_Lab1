const express = require('express');
const event = require('../models/Event');
const process = require('../models/Process');
const { authenticateToken } = require('../middleware/authenticateToken'); // ✅ Seguridad

const router = express.Router();

// 🔓 Rutas de consulta libre (GET)

router.get('/events', async (req, res) => {
  try {
    const events = await event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ messageInfo: err.message });
  }
});

router.get('/event/:id', async (req, res) => {
  try {
    const retrievedEvent = await event.findOne({ eventId: req.params.id });
    res.json(retrievedEvent);
  } catch (err) {
    res.status(500).json({ messageInfo: err.message });
  }
});

router.get('/events/searchByProcess/:processId', async (req, res) => {
  try {
    const events = await event
      .find({ processId: req.params.processId })
      .sort({ orderIndex: 'asc' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ messageInfo: err.message });
  }
});

router.get('/events/searchByDateRange', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: 'Se requieren start_date y end_date' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);

  if (Number.isNan(start.getTime()) || Number.isNan(end.getTime())) {
    return res.status(400).json({
      message: 'Fechas inválidas. Usa el formato YYYY-MM-DD o ISO 8601',
    });
  }

  try {
    const events = await event.find({
      dateStart: {
        $gte: start,
        $lte: end,
      },
    });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ messageInfo: err.message });
  }
});

router.get('/events/getByProcessOrdered', async (req, res) => {
  const { process_id } = req.query;

  if (!process_id) {
    return res.status(400).json({ message: 'Se requiere process_id' });
  }

  try {
    const pid = Number(process_id);
    const eventsList = await event
      .find({ processId: pid })
      .sort({ dateStart: 1 });
    res.status(200).json(eventsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/events/getByProcessOrderedDesc', async (req, res) => {
  const { process_id } = req.query;

  if (!process_id) {
    return res.status(400).json({ message: 'Se requiere process_id' });
  }

  try {
    const pid = Number(process_id);
    const eventsList = await event
      .find({ processId: pid })
      .sort({ dateStart: -1 });
    res.status(200).json(eventsList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/events/getProcess', async (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ message: 'Se requiere el event_id' });
  }

  try {
    const targetEvent = await event.findOne({ eventId: Number(event_id) });
    if (!targetEvent) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const relatedProcess = await process.findOne({
      processId: targetEvent.processId,
    });
    if (!relatedProcess) {
      return res
        .status(404)
        .json({ message: 'Proceso no encontrado para este evento' });
    }

    res.status(200).json(relatedProcess);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Rutas protegidas con token JWT

router.post('/event', authenticateToken, async (req, res) => {
  try {
    // Buscar el máximo eventId actual
    const maxEvent = await event.findOne().sort({ eventId: -1 }).limit(1);
    const nextId = maxEvent ? maxEvent.eventId + 1 : 1;

    const newEvent = new event({
      eventId: nextId, // Autoincremental
      processId: req.body.processId, // usar processId como viene
      orderIndex: req.body.orderIndex,
      name: req.body.name,
      description: req.body.description,
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
    });

    const insertedEvent = await newEvent.save();
    res.status(201).json(insertedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/event/update/:id', authenticateToken, async (req, res) => {
  const updatedEvent = {
    orderIndex: req.body.orderIndex,
    name: req.body.name,
    description: req.body.description,
    dateStart: req.body.dateStart,
    dateEnd: req.body.dateEnd,
  };
  try {
    const update = await event.findOneAndUpdate(
      { eventId: req.params.id },
      updatedEvent,
      { new: true }
    );
    res.status(200).json(update);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/events/delete/:id', authenticateToken, async (req, res) => {
  try {
    const eventDeleted = await event.deleteOne({ eventId: req.params.id });
    res.status(200).json(eventDeleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
