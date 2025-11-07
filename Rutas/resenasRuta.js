// Rutas/resenas.js
import express from "express";
import Resena from "../Modelos/Resena.js";
import { crear, top } from "../Controllers/resenasController.js";
import { verificarToken } from "../middleware/verificarToken.js";

const resenasRutas = express.Router();
resenasRutas.use(verificarToken);

// CREATE reseña -> solo si el usuario compró el producto
resenasRutas.post("/", async (req, res) => {
  try {
    return res.status(200).json(await crear());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas -> listar todas las reseñas con datos de usuario y producto
resenasRutas.get("/", async (req, res) => {
  try {
    const resenas = await Resena.find().populate("usuario_id", "nombre email").populate("producto_id", "nombre precio");
    res.json(resenas);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/product/:productId -> reseñas de un producto
resenasRutas.get("/product/:productId", async (req, res) => {
  try {
    const r = await Resena.find({ producto_id: req.params.productId }).populate("usuario_id", "nombre");
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/top -> promedio de calificaciones por producto
resenasRutas.get("/top", async (req, res) => {
  try {
    return res.status(200).json(await top());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/:id -> detalle reseña
resenasRutas.get("/:id", async (req, res) => {
  try {
    const r = await Resena.findById(req.params.id).populate("usuario_id", "nombre").populate("producto_id", "nombre");
    if (!r) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT actualizar reseña
resenasRutas.put("/:id", async (req, res) => {
  try {
    const r = await Resena.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE reseña
resenasRutas.delete("/:id", async (req, res) => {
  try {
    await Resena.findByIdAndDelete(req.params.id);
    res.json({ message: "Reseña eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default resenasRutas;
