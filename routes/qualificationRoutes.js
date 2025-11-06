const express = require('express');
const Qualification = require('../models/Qualification');
const { authenticateToken } = require('../middleware/authenticateToken'); // 🛡️ Middleware de seguridad

const router = express.Router();

// 🔓 Obtener todas las calificaciones
router.get('/qualifications', async (req, res) => {
  try {
    const qualifications = await Qualification.find();
    res.json(qualifications);
  } catch (err) {
    console.log("Server Error, failed to retrieve qualifications!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Failed to fetch qualifications' });
  }
});

// 🔓 Obtener calificación por ID
router.get('/qualification/:id', async (req, res) => {
  try {
    const qualification = await Qualification.findOne({ qualificationId: req.params.id });
    res.json(qualification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Crear una calificación
router.post('/qualification', authenticateToken, async (req, res) => {
  const newQualification = new Qualification({
    qualificationId: req.body.qualificationId,
    role: req.body.role,
    institution: req.body.institution,
    place: req.body.place,
    startYear: req.body.startYear,
    endYear: req.body.endYear,
    qualificationType: req.body.qualificationType,
    profileId: req.body.profileId,
  });

  try {
    const created = await newQualification.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Actualizar calificación
router.put('/qualification/update/:id', authenticateToken, async (req, res) => {
  const updatedData = {
    role: req.body.role,
    institution: req.body.institution,
    place: req.body.place,
    startYear: req.body.startYear,
    endYear: req.body.endYear,
    qualificationType: req.body.qualificationType,
    profileId: req.body.profileId,
  };

  try {
    const updated = await Qualification.findOneAndUpdate(
      { qualificationId: req.params.id },
      updatedData,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Eliminar calificación
router.delete('/qualification/delete/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Qualification.deleteOne({ qualificationId: req.params.id });
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

