import express from "express";
import Categoria from "../Modelos/Categoria.js";
import Producto from "../Modelos/Producto.js";
import { stats } from "../Controllers/categoriasController.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { soloAdmin } from "../middleware/verificarRol.js";

const categoriasRutas = express.Router();

categoriasRutas.use(verificarToken);

// Crear categoria
categoriasRutas.post("/", soloAdmin, async (req, res) => {
  try {
    const c = await Categoria.create(req.body);
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener todas las categorias
categoriasRutas.get("/", async (req, res) => {
  try {
    const cats = await Categoria.find();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener cantidad de productos por cada categoria
categoriasRutas.get("/stats",soloAdmin, async (req, res) => {
  try {
    return res.status(200).json(await stats());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener categoria por ID
categoriasRutas.get("/:id", async (req, res) => {
  try {
    const c = await Categoria.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actualizar categoria por ID
categoriasRutas.put("/:id",soloAdmin, async (req, res) => {
  try {
    const c = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Borrar categoria por ID
categoriasRutas.delete("/:id",soloAdmin, async (req, res) => {
  try {
    // opcional: desasignar categoria en productos
    await Producto.updateMany({ categoria_id: req.params.id }, { $unset: { categoria_id: "" } });
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: "Categoría eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default categoriasRutas;
