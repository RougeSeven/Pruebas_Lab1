const express = require('express');
const UserProfile = require('../models/UserProfile');
const { authenticateToken } = require('../middleware/authenticateToken'); // Seguridad integrada
const router = express.Router();

// 🔓 Obtener todos los perfiles de usuario
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await UserProfile.find();
    res.json(profiles);
  } catch (err) {
    console.log("Server Error, failed to retrieve logs!"+err.message);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// 🔓 Obtener perfil de usuario por ID
router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ profileId: req.params.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Crear nuevo perfil
router.post('/profile', authenticateToken, async (req, res) => {
  const newProfile = new UserProfile({
    profileId: req.body.profileId,
    title: req.body.title,
    bio: req.body.bio,
    address: req.body.address,
    profilePicture: req.body.profilePicture,
    accountId: req.body.accountId
  });

  try {
    const createdProfile = await newProfile.save();
    res.status(201).json(createdProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Actualizar perfil existente
router.put('/profile/update/:id', authenticateToken, async (req, res) => {
  const updatedData = {
    title: req.body.title,
    bio: req.body.bio,
    address: req.body.address,
    profilePicture: req.body.profilePicture,
    accountId: req.body.accountId
  };

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { profileId: req.params.id },
      updatedData,
      { new: true }
    );
    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Eliminar perfil
router.delete('/profile/delete/:id', authenticateToken, async (req, res) => {
  try {
    const deletedProfile = await UserProfile.deleteOne({ profileId: req.params.id });
    res.status(200).json(deletedProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Subir imagen de perfil (requiere configuración de multer)
router.post('/profile/uploadImage/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await UserProfile.findOneAndUpdate(
      { profileId: req.params.id },
      { profilePicture: req.body.profilePicture },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

