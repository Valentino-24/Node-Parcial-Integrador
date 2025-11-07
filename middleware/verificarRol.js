export const soloAdmin = (req, res, next) => {
  try {
    if (req.usuario?.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: solo administradores" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Error verificando rol" });
  }
};