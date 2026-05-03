import jwt from "jsonwebtoken";

// export const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ message: "Token tidak valid" });
//     req.user = decoded;
//     next();
//   });
// };

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });

    // Simpan hasil dekode ke req.user
    req.user = decoded;

    // Tambahkan alias agar req.user.id selalu ada apapun rolenya
    // Ini akan mengambil id dari user_id, umkm_id, atau admin_id
    req.user.id = decoded.id || decoded.umkm_id || decoded.admin_id;

    next();
  });
};
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Akses khusus admin" });
  next();
};

export const verifyUmkm = (req, res, next) => {
  if (req.user.role !== "umkm")
    return res.status(403).json({ message: "Akses khusus UMKM" });
  next();
};
