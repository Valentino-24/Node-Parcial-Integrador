// Rutas/usuarios.js
import express from "express";
import Usuario from "../Modelos/Usuario.js";
import Carrito from "../Modelos/Carrito.js";

const router = express.Router();

// GET /api/usuarios -> listar todos los usuarios (sin password)
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/usuarios/:id -> detalle de un usuario
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/usuarios -> registrar usuario
router.post("/", async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono, rol } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan datos requeridos" });
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: "Email ya registrado" });
    const user = await Usuario.create({ nombre, email, password, direccion, telefono, rol });
    res.status(201).json({ id: user._id, nombre: user.nombre, email: user.email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/usuarios/:id -> eliminar usuario y su carrito
router.delete("/:id", async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    await Carrito.deleteOne({ usuario_id: user._id });
    await Usuario.deleteOne({ _id: user._id });
    res.json({ message: "Usuario y carrito eliminados" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
