// Rutas/usuarios.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../Modelos/Usuario.js";
import Carrito from "../Modelos/Carrito.js";
import { verificarToken } from "../middleware/verificarToken.js";

const usuarioRutas = express.Router();


// POST /api/usuarios -> registrar usuario
usuarioRutas.post("/", async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono, rol } = req.body;

    if (!nombre || !email || !password) 
      return res.status(400).json({ error: "Faltan datos requeridos" });

    const existe = await Usuario.findOne({ email });
    if (existe) 
      return res.status(400).json({ error: "Email ya registrado" });

    // 🔹 Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Crear usuario con contraseña encriptada
    const user = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      direccion,
      telefono,
      rol
    });

    // 🔹 Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

usuarioRutas.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Faltan datos" });

    const user = await Usuario.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "Usuario no encontrado" });

    // 🔹 Comparar contraseñas
    const esValida = await bcrypt.compare(password, user.password);
    if (!esValida)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    // 🔹 Crear token
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

usuarioRutas.use(verificarToken);

// GET /api/usuarios -> listar todos los usuarios (sin password)
usuarioRutas.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/usuarios/:id -> detalle de un usuario
usuarioRutas.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) { res.status(500).json({ error: err.message }); }
});



usuarioRutas.delete("/:id", async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    await Carrito.deleteOne({ usuario_id: user._id });
    await Usuario.deleteOne({ _id: user._id });
    res.json({ message: "Usuario y carrito eliminados" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default usuarioRutas;
