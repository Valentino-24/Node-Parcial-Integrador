import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  direccion: { type: String },
  telefono: { type: String },
  rol: { type: String, enum: ["cliente", "admin"], default: "cliente" },
}, { timestamps: true });

//Método para comparar contraseñas en login
usuarioSchema.methods.matchPassword = async function(ingresada) {
  return await bcrypt.compare(ingresada, this.password);
};

export default mongoose.model("Usuario", usuarioSchema);