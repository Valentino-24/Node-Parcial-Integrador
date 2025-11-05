// Rutas/resenas.js
import express from "express";
import Resena from "../Modelos/Resena.js";
import Pedido from "../Modelos/Pedido.js";
import Producto from "../Modelos/Producto.js";

const router = express.Router();

// CREATE reseña -> solo si el usuario compró el producto
router.post("/", async (req, res) => {
  try {
    const { usuario_id, producto_id, calificacion, comentario } = req.body;
    if (!usuario_id || !producto_id || !calificacion) return res.status(400).json({ error: "Faltan datos" });

    // Buscar en pedidos si existe al menos un pedido del usuario que contenga ese producto_id
    const encontro = await Pedido.findOne({
      usuario_id,
      "items.producto_id": producto_id
    });

    if (!encontro) return res.status(403).json({ error: "Solo puede reseñar productos que haya comprado" });

    const r = await Resena.create({ usuario_id, producto_id, calificacion, comentario });

    // opcional: guardar referencia en producto.reseñas
    await Producto.findByIdAndUpdate(producto_id, { $push: { reseñas: r._id } });

    res.status(201).json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas -> listar todas las reseñas con datos de usuario y producto
router.get("/", async (req, res) => {
  try {
    const resenas = await Resena.find().populate("usuario_id", "nombre email").populate("producto_id", "nombre precio");
    res.json(resenas);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/product/:productId -> reseñas de un producto
router.get("/product/:productId", async (req, res) => {
  try {
    const r = await Resena.find({ producto_id: req.params.productId }).populate("usuario_id", "nombre");
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/top -> promedio de calificaciones por producto
router.get("/top", async (req, res) => {
  try {
    const agg = await Resena.aggregate([
      { $group: { _id: "$producto_id", avgRating: { $avg: "$calificacion" }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
      { $unwind: "$producto" },
      { $project: { productoId: "$producto._id", nombre: "$producto.nombre", avgRating: 1, count: 1 } },
      { $limit: 20 }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/resenas/:id -> detalle reseña
router.get("/:id", async (req, res) => {
  try {
    const r = await Resena.findById(req.params.id).populate("usuario_id", "nombre").populate("producto_id", "nombre");
    if (!r) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT actualizar reseña
router.put("/:id", async (req, res) => {
  try {
    const r = await Resena.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE reseña
router.delete("/:id", async (req, res) => {
  try {
    await Resena.findByIdAndDelete(req.params.id);
    res.json({ message: "Reseña eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
