import Carrito from "../Modelos/Carrito.js";
import Producto from "../Modelos/Producto.js";

// Agregar o actualizar producto del carrito
export const agregarActualizarItem = async (req, res) => {
  try {
    const { producto_id, cantidad = 1 } = req.body;
    if (!producto_id) return res.status(400).json({ error: "producto_id requerido" });
    let carrito = await Carrito.findOne({ usuario_id: req.params.usuarioId });
    if (!carrito) carrito = await Carrito.create({ usuario_id: req.params.usuarioId, items: [] });

    const idx = carrito.items.findIndex(i => i.producto_id.toString() === producto_id.toString());
    if (idx >= 0) carrito.items[idx].cantidad = Number(cantidad);
    else carrito.items.push({ producto_id, cantidad: Number(cantidad) });

    await carrito.save();
    const populated = await carrito.populate("items.producto_id");
    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Eliminar producto del carrito
export const eliminarItem = async (req, res) => {
  try {
    const carrito = await Carrito.findOneAndUpdate(
      { usuario_id: req.params.usuarioId },
      { $pull: { items: { producto_id: req.params.productoId } } },
      { new: true }
    ).populate("items.producto_id");
    res.json(carrito || { message: "Carrito actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Eliminar carrito completo
export const eliminarCarrito = async (req, res) => {
  try {
    await Carrito.findOneAndDelete({ usuario_id: req.params.usuarioId });
    res.json({ message: "Carrito eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Calcular total del carrito
export const total = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario_id: req.params.usuarioId }).populate("items.producto_id");
    if (!carrito) return res.status(404).json({ error: "Carrito no encontrado" });

    let total = 0;
    const items = carrito.items.map(i => {
      const prod = i.producto_id;
      const precio = prod ? prod.precio : 0;
      const subtotal = precio * i.cantidad;
      total += subtotal;
      return { producto: prod ? { id: prod._id, nombre: prod.nombre, precio } : null, cantidad: i.cantidad, subtotal };
    });

    res.json({ items, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
