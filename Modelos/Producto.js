import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria" },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  marca: String,
  reseñas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resena" }]
}, { timestamps: true });

export default mongoose.model("Producto", productoSchema);
