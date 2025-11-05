// Rutas/categorias.js
import express from "express";
import Categoria from "../Modelos/Categoria.js";
import Producto from "../Modelos/Producto.js";

const router = express.Router();

// CREATE categoria
router.post("/", async (req, res) => {
  try {
    const c = await Categoria.create(req.body);
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// READ todas las categorias
router.get("/", async (req, res) => {
  try {
    const cats = await Categoria.find();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/categorias/stats -> cantidad de productos por categoría
router.get("/stats", async (req, res) => {
  try {
    const agg = await Categoria.aggregate([
      { $lookup: { from: "productos", localField: "_id", foreignField: "categoria_id", as: "productos" } },
      { $project: { nombre: 1, cantidadProductos: { $size: "$productos" } } },
      { $sort: { cantidadProductos: -1 } }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET categoria por id
router.get("/:id", async (req, res) => {
  try {
    const c = await Categoria.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT actualizar
router.put("/:id", async (req, res) => {
  try {
    const c = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE categoria
router.delete("/:id", async (req, res) => {
  try {
    // opcional: desasignar categoria en productos
    await Producto.updateMany({ categoria_id: req.params.id }, { $unset: { categoria_id: "" } });
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: "Categoría eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
