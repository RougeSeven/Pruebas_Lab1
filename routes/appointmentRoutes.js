const express = require('express');
const router = express.Router();
const dateFns = require('date-fns');
const appointment = require('../models/Appointment');
const controller = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authenticateToken'); // 🔒 Nuevo

// 🔐 Todas las rutas protegidas por token

router.get('/account/:accountId/appointments', authenticateToken, async (req, res) => {
  try {
    const appointmentList = await appointment.find({ accountId: req.params.accountId }).sort({ date: 'asc' });
    res.status(200).json(appointmentList);
  } catch (err) {
    console.log("Server Error, no data returned!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al intentar recuperar los pendientes' });
  }
});

router.get('/account/:accountId/appointment/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentObject = await appointment.findOne({ accountId: req.params.accountId, appointmentId: req.params.id });
    if (appointmentObject) {
      res.status(200).json(appointmentObject);
    } else {
      res.status(404).json({ error: 'Evento no encontrado' });
    }
  } catch (err) {
    console.log("Server Error, no appointment data returned!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar el pendiente' });
  }
});

router.post("/appointment", authenticateToken, async (req, res) => {
  const newAppointment = new appointment({
    appointmentId: req.body.appointmentId,
    type: req.body.type,
    date: req.body.date,
    description: req.body.description,
    contactInfo: req.body.contactInfo,
    accountId: req.body.accountId
  });
  try {
    const insertedAppointment = await newAppointment.save();
    res.status(201).json(insertedAppointment);
  } catch (err) {
    console.log("Server Error, no appointment could not be created!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al crear el pendiente' });
  }
});

router.put("/appointment/:id", authenticateToken, async (req, res) => {
  const updatedAppointment = {
    type: req.body.type,
    date: req.body.date,
    description: req.body.description,
    contactInfo: req.body.contactInfo,
  };
  try {
    const update = await appointment.findOneAndUpdate({ appointmentId: req.params.id }, updatedAppointment, { new: true });
    res.status(200).json(update);
  } catch (err) {
    console.log("Server Error, appointment could not be updated!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al actualizar el pendiente' });
  }
});

router.delete('/appointment/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentDeleted = await appointment.deleteOne({ appointmentId: req.params.id });
    res.status(200).json(appointmentDeleted);
  } catch (err) {
    console.log("Server Error, failed to delete appointment!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al eliminar el pendiente' });
  }
});

router.get('/account/:accountId/appointments/:year/:month', authenticateToken, async (req, res) => {
  try {
    const monthAppointments = await controller.getAppointmentsByMonth(req.params.accountId, req.params.month, req.params.year);
    res.status(200).json(monthAppointments);
  } catch (err) {
    console.log("Server Error, could not retrieve calendar!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al recuperar el calendario' });
  }
});

router.get('/account/:accountId/appointments/week', authenticateToken, async (req, res) => {
  try {
    const weeklyAppointments = await controller.getWeeklyAppointments(req.params.accountId);
    if (weeklyAppointments.length > 0) {
      res.status(200).json(weeklyAppointments);
    } else {
      res.status(200).json({ message: "No se han encontrado pendientes para la semana" });
    }
  } catch (err) {
    console.log("Server Error, could not retrieve calendar!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al recuperar el calendario' });
  }
});

router.get('/account/:accountId/appointments/close', authenticateToken, async (req, res) => {
  try {
    const closeAppointments = await controller.getCloseAppointments(req.params.accountId);
    if (closeAppointments.length > 0) {
      res.status(200).json(closeAppointments);
    } else {
      res.status(200).json({ message: "No existen pendientes próximos" });
    }
  } catch (err) {
    console.log("Server Error, could not retrieve appointments!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al recuperar los pendientes próximos' });
  }
});

router.post('/appointment/:id/reminder', authenticateToken, async (req, res) => {
  const numberOfDaysBefore = req.body.daysBefore;
  if (numberOfDaysBefore < 1) {
    res.status(400).json({ message: 'Error, no se pueden crear recordatorios para menos de 1 día antes' });
  } else {
    try {
      await controller.setReminder(req.params.id, req.body.title, numberOfDaysBefore);
      res.status(201).json({ message: 'Recordatorio creado con éxito' });
    } catch (err) {
      console.log("Server Error, failed to create reminder!");
      console.error("Error details: "+err.message);
      res.status(500).json({ message: "Error al crear el recordatorio" });
    }
  }
});

module.exports = router;
