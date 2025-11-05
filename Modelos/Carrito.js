import mongoose from "mongoose";

const carritoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  items: [
    {
      producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
      cantidad: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Carrito", carritoSchema);
