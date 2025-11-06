const express = require('express');
const account = require('../models/Account');
const bcrypt = require('bcrypt');
const crypto=require('node:crypto');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authenticateToken'); // ✅ añadido
const router = express.Router();

// 🛡️ Rutas protegidas por token
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await account.find();
    res.json(accounts);
  } catch (err) {
    console.log("Server Error, account information could not be returned!");
    console.log("Error details: "+err.message);
    res.status(500).json({ error: 'Error al obtener las cuentas' });
  }
});

router.get('/account/:id', authenticateToken, async (req, res) => {
  try {
    const accounts = await account.findOne({ accountId: req.params.id });
    res.json(accounts);
  } catch (err) {
    console.log("Server Error, account information could not be returned!");
    res.status(500).json({ message: err.message });
  }
});

router.put('/accounts/update/:id', authenticateToken, async (req, res) => {
  const updatedAccount = {
    name: req.body.name,
    lastname: req.body.lastname,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
  };
  try {
    const update = await account.findOneAndUpdate(
      { accountId: req.params.id },
      updatedAccount,
      { new: true }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("Server Error, account information could not be updated!");
    res.status(500).json({ message: err.message });
  }
});

router.delete('/accounts/delete/:id', authenticateToken, async (req, res) => {
  try {
    const accountDeleted = await account.deleteOne({
      accountId: req.params.id,
    });
    res.status(200).json(accountDeleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 👤 Registro y login (no requieren token)
router.post('/account', async (req, res) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newAccount = new account({
      password: hashedPassword,
      name: req.body.name,
      lastname: req.body.lastname,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
    });

    const insertedAccount = await newAccount.save();
    res.status(201).json(insertedAccount);
  } catch (err) {
    if (err.code === 11000) {
      // clave duplicada (por ejemplo, email)
      return res
        .status(400)
        .json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error('❌ Error al registrar cuenta:', err);
    res.status(500).json({ message: err.message });
  }
});
// 🔐 LOGIN
router.post('/account/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await account.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'tu_clave_secreta', // ⚠️ Asegúrate de definir esta variable
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔁 Recuperación de contraseña (sin protección de token)
function generateResetToken(length = 32) {
  return crypto.randomBytes(length);
}

router.post('/accounts/requestPasswordReset', async (req, res) => {
  console.log('📩 Request reset → Body recibido:', req.body);
  const { email } = req.body;
  try {
    const user = await account.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Correo no encontrado' });

    const resetToken = generateResetToken(32);
    user.resetToken = resetToken;
    user.tokenExpires = Date.now() + 3600000;
    await user.save();

    res.status(200).json({
      message: 'Password reset link sent to email',
      resetToken,
    });
  } catch (err) {
    console.error('❌ Error en requestPasswordReset:', err);
    res.status(500).json({ error: 'Error al generar token de reseteo' });
  }
});

router.post('/accounts/sendRecoveryEmail', async (req, res) => {
  console.log('📩 Request reset → Body recibido:', req.body);
  const { email, reset_token } = req.body;
  try {
    console.log(`Enviar correo a ${email} con token: ${reset_token}`);
    res.status(200).json({ message: 'Recovery email sent' });
  } catch (err) {
    console.log("Server Error, recovery email could not be sent!");
    console.log("Error details: "+err.message);
    res.status(500).json({ error: 'Error al enviar correo de recuperación' });
  }
});

module.exports = router;
