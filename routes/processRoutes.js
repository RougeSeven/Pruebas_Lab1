const express = require('express');
const process = require('../models/Process');
const event = require('../models/Event');
const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

// 🔓 Obtener todos los procesos (libre)
router.get('/processes', async (req, res) => {
  try {
    const processes = await process.find();
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔓 Obtener proceso por processId (libre)
router.get('/process/:id', async (req, res) => {
  try {
    const processId = Number(req.params.id);
    if (Number.isNan(processId)) {
      return res
        .status(400)
        .json({ message: 'El processId debe ser numérico' });
    }
    const processObject = await process.findOne({ processId });
    if (!processObject) {
      return res.status(404).json({ message: 'Proceso no encontrado' });
    }
    res.status(200).json(processObject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Crear nuevo proceso (autoincrementa processId y startDate automático)
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const newProcess = new process({
      accountId: req.body.accountId,
      title: req.body.title,
      processType: req.body.processType,
      offense: req.body.offense,
      province: req.body.province,
      canton: req.body.canton,
      clientGender: req.body.clientGender,
      clientAge: req.body.clientAge,
      processStatus: req.body.processStatus,
      lastUpdate: req.body.lastUpdate || null,
      // No envías startDate para que se asigne fecha actual automáticamente
      endDate: req.body.endDate || null,
      processNumber: req.body.processNumber,
      processDescription: req.body.processDescription,
    });

    const insertedProcess = await newProcess.save();
    res.status(201).json(insertedProcess);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Actualizar proceso (actualiza lastUpdate automáticamente)
router.put('/process/:id/update', authenticateToken, async (req, res) => {
  try {
    const updatedProcess = {
      title: req.body.title,
      processType: req.body.processType,
      offense: req.body.offense,
      province: req.body.province,
      canton: req.body.canton,
      clientGender: req.body.clientGender,
      clientAge: req.body.clientAge,
      processStatus: req.body.processStatus,
      lastUpdate: new Date(), // fecha actual
      startDate: req.body.startDate || undefined, // si no se envía, no modifica
      endDate: req.body.endDate || null,
      processNumber: req.body.processNumber,
      processDescription: req.body.processDescription,
    };

    const update = await process.findOneAndUpdate(
      { processId: Number(req.params.id) },
      updatedProcess,
      { new: true }
    );

    if (!update)
      return res.status(404).json({ message: 'Proceso no encontrado' });

    res.status(200).json(update);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Resumen de proceso con eventos y elapsedTime
router.get('/process/:id/summary', authenticateToken, async (req, res) => {
  try {
    const processObject = await process.findOne({
      processId: Number(req.params.id),
    });
    if (!processObject)
      return res.status(404).json({ message: 'Proceso no encontrado' });

    if (processObject.processStatus === 'not started') {
      return res.status(400).json({ message: 'Proceso no iniciado' });
    }

    const selectionQuery = { name: 1, dateStart: 1, dateEnd: 1 };
    const processEvents = await event
      .find({ processId: Number(req.params.id) })
      .sort({ orderIndex: 'asc' })
      .select(selectionQuery);

    if (processEvents.length === 0) {
      return res
        .status(404)
        .json({ message: 'No hay eventos para este proceso' });
    }

    const startDate = processEvents[0].dateStart;
    const lastDate = processEvents.at(-1).dateEnd ?? new Date().toISOString();
    const elapsedTime = calculateWeeksMonthsElapsed(startDate, lastDate);

    const processSummary = {
      processTitle: processObject.title,
      dateStart: startDate,
      lastUpdate: lastDate,
      elapsedTime,
      eventsList: processEvents,
    };

    res.status(200).json(processSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function calculateWeeksMonthsElapsed(startDate, endDate) {
  const difference = new Date(endDate) - new Date(startDate);
  let days = difference / (1000 * 60 * 60 * 24);
  let weeks = days / 7;

  let months = Math.floor(days / 30.44);
  days = Math.floor(days - weeks * 7);
  weeks = Math.floor(weeks - months * 4);

  return {
    monthsElapsed: months,
    weeksElapsed: weeks,
    daysElapsed: days,
  };
}

// 🔐 Búsquedas sensibles (protegidas)
router.get('/processes/searchByTitle', authenticateToken, async (req, res) => {
  const { title } = req.query;
  try {
    const results = await process.find({
      title: { $regex: title, $options: 'i' },
    });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  '/processes/searchByLastUpdate',
  authenticateToken,
  async (req, res) => {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ error: 'Se requieren start_date y end_date en el query' });
    }
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (Number.isNan(start.getTime()) || Number.isNan(end.getTime())) {
      return res.status(400).json({
        error: 'Formato de fecha inválido. Usa YYYY-MM-DD o ISO 8601.',
      });
    }
    try {
      const results = await process.find({
        lastUpdate: { $gte: start, $lte: end },
      });
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  '/processes/searchByProvince',
  authenticateToken,
  async (req, res) => {
    const { province } = req.query;
    try {
      const results = await process.find({
        province: { $regex: province, $options: 'i' },
      });
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/processes/searchByStatus', authenticateToken, async (req, res) => {
  const { status } = req.query;
  try {
    const results = await process.find({ processStatus: status });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/processes/searchByType', authenticateToken, async (req, res) => {
  const { type } = req.query;
  try {
    const results = await process.find({ processType: type });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  '/processes/searchByProcessId',
  authenticateToken,
  async (req, res) => {
    const { process_id } = req.query;
    try {
      const result = await process.findOne({ processId: Number(process_id) });
      if (!result) {
        return res.status(404).json({ message: 'Proceso no encontrado' });
      }
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
