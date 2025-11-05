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

//Encriptar contraseña antes de guardar
usuarioSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Método para comparar contraseñas en login
usuarioSchema.methods.matchPassword = async function(ingresada) {
  return await bcrypt.compare(ingresada, this.password);
};

export default mongoose.model("Usuario", usuarioSchema);