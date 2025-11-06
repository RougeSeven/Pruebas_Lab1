require('dotenv').config();
const express = require('express');
const router = express.Router();
const reminder = require('../models/Reminder');
const controller = require('../controllers/reminderController');
const { authenticateToken } = require('../middleware/authenticateToken'); // 🛡️ Seguridad

// 🔓 Obtener todos los recordatorios (consulta libre)
router.get('/reminders', async (req, res) => {
  try {
    const reminderList = await reminder.find().sort({ dateTime: 'asc' });
    res.status(200).json(reminderList);
  } catch (err) {
    console.log("Server Error, failed to retrieve reminders!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al intentar recuperar los recordatorios' });
  }
});

// 🔓 Obtener un recordatorio por ID (consulta libre)
router.get('/reminder/:id', async (req, res) => {
  try {
    const reminderObject = await reminder.findOne({ reminderId: req.params.id });
    reminderObject
      ? res.status(200).json(reminderObject)
      : res.status(404).json({ error: 'Evento no encontrado' });
  } catch (err) {
    console.log("Server Error, could not find reminder!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar el recordatorio' });
  }
});

// 🔐 Crear nuevo recordatorio
router.post('/reminder', authenticateToken, async (req, res) => {
  try {
    const insertedReminder = await controller.createReminder(req);
    res.status(201).json(insertedReminder);
  } catch (err) {
    console.log("Server Error, could not create reminder!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al crear el recordatorio' });
  }
});

// 🔐 Actualizar recordatorio existente
router.put('/reminder/:id', authenticateToken, async (req, res) => {
  const updatedReminder = {
    title: req.body.title,
    dateTime: req.body.dateTime,
    activeFlag: req.body.activeFlag
  };
  try {
    const update = await reminder.findOneAndUpdate(
      { reminderId: req.params.id },
      updatedReminder,
      { new: true }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("Server Error, could not update reminder!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al actualizar el recordatorio' });
  }
});

// 🔐 Eliminar recordatorio
router.delete('/reminder/:id', authenticateToken, async (req, res) => {
  try {
    const reminderDeleted = await reminder.deleteOne({ reminderId: req.params.id });
    res.status(200).json(reminderDeleted);
  } catch (err) {
    console.log("Server Error, failed to delete reminder!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al eliminar el recordatorio' });
  }
});

// 🔐 Enviar recordatorio por correo electrónico
router.post('/reminder/:id/emailNotification', authenticateToken, async (req, res) => {
  try {
    const reminderEmail = await controller.makeReminderEmail(
      req.params.id,
      req.body.emailReceiver
    );
    await controller.transporter.sendMail(reminderEmail);
    res.status(200).json({ message: 'Recordatorio enviado' });
  } catch (err) {
    console.log("Server Error, failed to send reminder!");
    console.error("Error details: "+err.message);
    res.status(500).json(err.message);
  }
});

module.exports = router;
