import Resena from "../Modelos/Resena.js";
import Pedido from "../Modelos/Pedido.js";
import Producto from "../Modelos/Producto.js";

// Crear reseña
export const crear = async (data) => {
  const { usuario_id, producto_id, calificacion, comentario } = data;

  if (!usuario_id || !producto_id || !calificacion)
    throw new Error("Faltan datos");

  // Verificar que el usuario haya comprado el producto
  const pedido = await Pedido.findOne({
    usuario_id,
    "items.producto_id": producto_id
  });

  if (!pedido)
    throw new Error("Solo puede reseñar productos que haya comprado");

  const r = await Resena.create({ usuario_id, producto_id, calificacion, comentario });

  await Producto.findByIdAndUpdate(producto_id, { $push: { reseñas: r._id } });

  return r;
};

// Top reseñas
export const top = async () => {
  const agg = await Resena.aggregate([
    {
      $group: {
        _id: "$producto_id",
        PromedioCalificaciones: { $avg: "$calificacion" },
        Resenias: { $sum: 1 }
      }
    },
    { $sort: { PromedioCalificaciones: -1, Resenias: -1 } },
    {
      $lookup: {
        from: "productos",
        localField: "_id",
        foreignField: "_id",
        as: "producto"
      }
    },
    { $unwind: "$producto" },
    {
      $project: {
        productoId: "$producto._id",
        nombre: "$producto.nombre",
        PromedioCalificaciones: 1,
        Resenias: 1
      }
    },
    { $limit: 20 }
  ]);
  return agg;
};