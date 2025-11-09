import Producto from "../Modelos/Producto.js";
import Resena from "../Modelos/Resena.js";
import mongoose from "mongoose";

//Filtrar productos por precio y marca
export const filtro = async (query) => {
  const { minPrice, maxPrice, marca } = query;
  const filtro = {};
  if (minPrice || maxPrice) filtro.precio = {};
  if (minPrice) filtro.precio.$gte = Number(minPrice);
  if (maxPrice) filtro.precio.$lte = Number(maxPrice);
  if (marca) filtro.marca = marca;
  const productos = await Producto.find(filtro).populate("categoria_id", "nombre");
  return productos;
};

// Listar los 10 productos con más reseñas
export const top = async () => {
  const agg = await Resena.aggregate([
    { $group: { _id: "$producto_id", reseñasCount: { $sum: 1 } } },
    { $sort: { reseñasCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
    { $unwind: "$producto" },
    { $project: { 
        _id: "$producto._id", 
        nombre: "$producto.nombre", 
        reseñasCount: 1, 
        precio: "$producto.precio", 
        categoria_id: "$producto.categoria_id" 
      } 
    }
  ]);
  return agg;
};
