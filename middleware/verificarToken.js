import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // formato: "Bearer token"
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // guardamos los datos del token (id, email, rol)
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};