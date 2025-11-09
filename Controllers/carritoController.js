import Carrito from "../Modelos/Carrito.js";
import Producto from "../Modelos/Producto.js";

// Agregar o actualizar producto del carrito
export const agregarActualizarItem = async (usuarioId, body) => {
  const { producto_id, cantidad = 1 } = body;
  if (!producto_id) throw new Error("producto_id requerido");

  let carrito = await Carrito.findOne({ usuario_id: usuarioId });
  if (!carrito) carrito = await Carrito.create({ usuario_id: usuarioId, items: [] });

  const idx = carrito.items.findIndex(i => i.producto_id.toString() === producto_id.toString());
  if (idx >= 0) carrito.items[idx].cantidad = Number(cantidad);
  else carrito.items.push({ producto_id, cantidad: Number(cantidad) });

  await carrito.save();
  return await carrito.populate("items.producto_id");
};

// Eliminar producto del carrito
export const eliminarItem = async (usuarioId, productoId) => {
  const carrito = await Carrito.findOneAndUpdate(
    { usuario_id: usuarioId },
    { $pull: { items: { producto_id: productoId } } },
    { new: true }
  ).populate("items.producto_id");
  return carrito || { message: "Carrito actualizado" };
};

// Eliminar carrito completo
export const eliminarCarrito = async (usuarioId) => {
  await Carrito.findOneAndDelete({ usuario_id: usuarioId });
  return { message: "Carrito eliminado" };
};

// Calcular total del carrito
export const total = async (usuarioId) => {
  const carrito = await Carrito.findOne({ usuario_id: usuarioId }).populate("items.producto_id");
  if (!carrito) throw new Error("Carrito no encontrado");

  let total = 0;
  const items = carrito.items.map(i => {
    const prod = i.producto_id;
    const precio = prod ? prod.precio : 0;
    const subtotal = precio * i.cantidad;
    total += subtotal;
    return { producto: prod ? { id: prod._id, nombre: prod.nombre, precio } : null, cantidad: i.cantidad, subtotal };
  });

  return { items, total };
};