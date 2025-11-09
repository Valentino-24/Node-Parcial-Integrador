import Producto from "../Modelos/Producto.js";
import Resena from "../Modelos/Resena.js";
import mongoose from "mongoose";

export const crear = async (req, res) => {
  try {
    const p = await Producto.create(req.body);
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listar = async (req, res) => {
  try {
    const productos = await Producto.find().populate("categoria_id", "nombre descripcion");
    res.json(productos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const filtro = async (req, res) => {
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
};

export const top = async (req, res) => {
  try {
    const agg = await Resena.aggregate([
      { $group: { _id: "$producto_id", reseñasCount: { $sum: 1 } } },
      { $sort: { reseñasCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
      { $unwind: "$producto" },
      { $project: { _id: "$producto._id", nombre: "$producto.nombre", reseñasCount: 1, precio: "$producto.precio", categoria_id: "$producto.categoria_id" } }
    ]);
    res.json(agg);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
