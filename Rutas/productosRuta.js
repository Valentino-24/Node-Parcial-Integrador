// Rutas/productos.js
import express from "express";
import Producto from "../Modelos/Producto.js";
import Resena from "../Modelos/Resena.js";
import { top } from "../Controllers/productosController.js";

const productosRuta = express.Router();

// CREATE producto
productosRuta.post("/", async (req, res) => {
  try {
    const p = await Producto.create(req.body);
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// READ all productos con su categoría
productosRuta.get("/", async (req, res) => {
  try {
    const productos = await Producto.find().populate("categoria_id", "nombre descripcion");
    res.json(productos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// query: minPrice, maxPrice, marca
productosRuta.get("/filtro", async (req, res) => {
  try {
    const { minPrice, maxPrice, marca } = req.query;
    const filtro = {};
    if (minPrice || maxPrice) filtro.precio = {};
    if (minPrice) filtro.precio.$gte = Number(minPrice);
    if (maxPrice) filtro.precio.$lte = Number(maxPrice);
    if (marca) filtro.marca = marca;
    const productos = await Producto.find(filtro).populate("categoria_id", "nombre");
    res.json(productos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/productos/top -> productos más reseñados (por cantidad de reseñas)
productosRuta.get("/top", async (req, res) => {
  try {
    return res.status(200).json(await top());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/productos/:id/stock -> actualizar stock
productosRuta.patch("/:id/stock", async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock == null) return res.status(400).json({ error: "Enviar campo stock" });
    const producto = await Producto.findByIdAndUpdate(req.params.id, { $set: { stock: Number(stock) } }, { new: true });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE producto completo
productosRuta.put("/:id", async (req, res) => {
  try {
    const p = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE producto
productosRuta.delete("/:id", async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: "Producto eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default productosRuta;
