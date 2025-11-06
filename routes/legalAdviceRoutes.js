const express = require('express');
const router = express.Router();
const legalAdvice = require('../models/LegalAdvice');
const { authenticateToken } = require('../middleware/authenticateToken'); // 🔐 Middleware de seguridad

// 🟢 Consulta abierta del listado completo
router.get('/adviceList', async (req, res) => {
  try {
    const legalAdviceList = await legalAdvice.find();
    res.status(200).json(legalAdviceList);
  } catch (err) {
    console.log("Server Error, failed to retrieve legal tips!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al recuperar los tips legales' });
  }
});

// 🟢 Consulta abierta de tip individual
router.get('/legalAdvice/:id', async (req, res) => {
  try {
    const legalAdviceObject = await legalAdvice.findOne({ adviceId: req.params.id });
    legalAdviceObject
      ? res.status(200).json(legalAdviceObject)
      : res.status(404).json({ error: 'Tip no encontrado' });
  } catch (err) {
    console.log("Server Error, failed to find tip!");
    console.error("Error details: "+err.message);
    res.status(500).json({ error: 'Error al buscar el tip' });
  }
});

// 🔐 Crear nuevo tip legal
router.post("/legalAdvice", authenticateToken, async (req, res) => {
  const newLegalAdvice = new legalAdvice({
    adviceId: req.body.adviceId,
    topic: req.body.topic,
    content: req.body.content
  });
  try {
    const insertedLegalAdvice = await newLegalAdvice.save();
    res.status(201).json(insertedLegalAdvice);
  } catch (err) {
    console.log("Server Error, could not create tip!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al crear el tip' });
  }
});

// 🔐 Actualizar contenido de un tip legal
router.put("/legalAdvice/:id", authenticateToken, async (req, res) => {
  const updatedLegalAdvice = {
    topic: req.body.topic,
    content: req.body.content
  };
  try {
    const update = await legalAdvice.findOneAndUpdate(
      { adviceId: req.params.id },
      updatedLegalAdvice,
      { new: true }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("Server Error, could not update tip!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al actualizar el tip' });
  }
});

// 🔐 Eliminar tip legal por ID
router.delete('/legalAdvice/:id', authenticateToken, async (req, res) => {
  try {
    const legalAdviceDeleted = await legalAdvice.deleteOne({ adviceId: req.params.id });
    res.status(200).json(legalAdviceDeleted);
  } catch (err) {
    console.log("Server Error, could not delete tip!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al eliminar el tip' });
  }
});

// 🔐 Generar texto vinculado (regla de negocio)
router.get("/legalAdvice/:id/attachment", authenticateToken, async (req, res) => {
  try {
    const selectedText = req.body.text;
    const adviceId = req.params.id;
    let linkedText = `<a href='/legalstystem/legalAdvice/${adviceId}'>${selectedText}</a>`;
    res.status(200).send(linkedText);
  } catch (err) {
    console.log("Server Error, failed to attach tip!");
    console.error("Error details: "+err.message);
    res.status(500).json({ message: 'Error al vincular el tip' });
  }
});

module.exports = router;
