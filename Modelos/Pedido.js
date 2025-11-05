import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  items: [
    {
      producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
      cantidad: Number,
      subtotal: Number
    }
  ],
  total: Number,
  estado: { type: String, enum: ["pendiente", "pagado", "enviado", "entregado"], default: "pendiente" },
  metodo_pago: { type: String },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Pedido", pedidoSchema);
