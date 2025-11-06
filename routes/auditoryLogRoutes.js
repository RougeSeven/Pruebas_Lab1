const express = require('express');
const router = express.Router();
const dateFns = require('date-fns');
const auditoryLog = require('../models/AuditoryLog');
const { authenticateToken } = require('../middleware/authenticateToken'); // ✅ añadido

// Opcional: agregar token aquí si deseas restringir lectura
router.get('/auditoryLogs', async (req, res) => {
  try {
    const activityLogs = await auditoryLog.find();
    res.status(200).json(activityLogs);
  } catch (err) {
    console.log("Server Error, failed to retrieve logs!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al recuperar los registros de actividad' });
  }
});

router.get('/auditoryLog/:id', async (req, res) => {
  try {
    const auditoryLogObject = await auditoryLog.findOne({ auditoryLogId: req.params.id });
    if (auditoryLogObject) {
      res.status(200).json(auditoryLogObject);
    } else {
      res.status(404).json({ error: 'Registro de actividad no encontrado' });
    }
  } catch (err) {
    console.log("Server Error, could not retrieve log!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar el registro' });
  }
});

router.get('/auditoryLogs/user/:id', async (req, res) => {
  try {
    const userActivityLogs = await auditoryLog.find({ accountId: req.params.id });
    if (userActivityLogs.length > 0) {
      res.status(200).json(userActivityLogs);
    } else {
      res.status(200).json({ message: 'No hay actividad registrada del usuario' });
    }
  } catch (err) {
    console.log("Server Error, failed to find logs!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar los registros' });
  }
});

router.get('/auditoryLogs/process/:id', async (req, res) => {
  try {
    const processActivityLogs = await auditoryLog.find({ processId: req.params.id });
    if (processActivityLogs.length > 0) {
      res.status(200).json(processActivityLogs);
    } else {
      res.status(200).json({ error: 'No se ha detectado actividad sobre este proceso' });
    }
  } catch (err) {
    console.log("Server Error, failed to find log!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar el registro' });
  }
});

// 🔐 Rutas protegidas por token
router.post('/auditoryLog', authenticateToken, async (req, res) => {
  const currentDate = new Date();
  const newAuditoryLog = new auditoryLog({
    auditoryLogId: req.body.auditoryLogId,
    logAction: req.body.logAction,
    logTime: currentDate,
    accountId: req.body.accountId,
    processId: req.body.processId
  });
  try {
    const insertedLog = await newAuditoryLog.save();
    res.status(201).json(insertedLog);
  } catch (err) {
    console.log("Server Error, failed to create log!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/auditoryLog/:id', authenticateToken, async (req, res) => {
  const logUpdate = {
    logAction: req.body.logAction
  };
  try {
    const updatedLog = await auditoryLog.findOneAndUpdate(
      { auditoryLogId: req.params.id },
      logUpdate,
      { new: true }
    );
    res.status(201).json(updatedLog);
  } catch (err) {
    console.log("Server Error, failed to update log!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al actualizar el log' });
  }
});

router.delete('/auditoryLog/:id', authenticateToken, async (req, res) => {
  try {
    const deleteConfirmation = await auditoryLog.findOneAndDelete({ auditoryLogId: req.params.id });
    res.status(201).json({ message: 'Log eliminado con éxito.' }, deleteConfirmation);
  } catch (err) {
    console.log("Server Error, failed to delete log!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al eliminar el log' });
  }
});

module.exports = router;
