import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String
});

export default mongoose.model("Categoria", categoriaSchema);
