import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Umkm, Admin } from "../models/index.js";

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const emailAlreadyExists = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) return true;

  const umkm = await Umkm.findOne({ where: { email } });
  if (umkm) return true;

  const admin = await Admin.findOne({ where: { email } });
  if (admin) return true;

  return false;
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    if (await emailAlreadyExists(email)) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ nama, email, password: hash });

    res.status(201).json({ message: "User berhasil register" });
  } catch (error) {
    console.error("Register User Error:", error);
    res.status(500).json({
      message: "Register user gagal",
      error: error.message,
    });
  }
};

export const registerUmkm = async (req, res) => {
  try {
    const { nama_toko, email, password, alamat, latitude, longitude } =
      req.body;

    if (
      !nama_toko ||
      !email ||
      !password ||
      !alamat ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    if (await emailAlreadyExists(email)) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);
    await Umkm.create({
      nama_toko,
      email,
      password: hash,
      alamat,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "UMKM berhasil register, menunggu verifikasi admin",
    });
  } catch (error) {
    console.error("Register UMKM Error:", error);
    res.status(500).json({
      message: "Register UMKM gagal",
      error: error.message,
    });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    if (await emailAlreadyExists(email)) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);
    await Admin.create({ nama, email, password: hash });

    res.status(201).json({ message: "Admin berhasil register" });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({
      message: "Register admin gagal",
      error: error.message,
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    const token = createToken({ id: user.id, role: "user" });
    res.json({ token });
  } catch (error) {
    console.error("Login User Error:", error);
    res.status(500).json({
      message: "Login user gagal",
      error: error.message,
    });
  }
};

export const loginUmkm = async (req, res) => {
  try {
    const { email, password } = req.body;

    const umkm = await Umkm.findOne({ where: { email } });
    if (!umkm) return res.status(404).json({ message: "UMKM tidak ditemukan" });

    if (umkm.status !== "aktif") {
      return res.status(403).json({ message: "UMKM belum diverifikasi admin" });
    }

    const match = await bcrypt.compare(password, umkm.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    const token = createToken({ id: umkm.id, role: "umkm" });
    res.json({ token });
  } catch (error) {
    console.error("Login UMKM Error:", error);
    res.status(500).json({
      message: "Login UMKM gagal",
      error: error.message,
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin)
      return res.status(404).json({ message: "Admin tidak ditemukan" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    const token = createToken({ id: admin.id, role: "admin" });
    res.json({ token });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({
      message: "Login admin gagal",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    // ===== 1. CEK USER =====
    const user = await User.findOne({ where: { email } });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: "Password salah" });

      const token = createToken({ id: user.id, role: "user" });
      return res.json({
        message: "Login user berhasil",
        token,
        role: "user",
        user_id: user.id,
      });
    }

    // ===== 2. CEK UMKM =====
    const umkm = await Umkm.findOne({ where: { email } });
    if (umkm) {
      if (umkm.status !== "aktif") {
        return res
          .status(403)
          .json({ message: "UMKM belum diverifikasi admin" });
      }

      const match = await bcrypt.compare(password, umkm.password);
      if (!match) return res.status(400).json({ message: "Password salah" });

      const token = createToken({ umkm_id: umkm.id, role: "umkm" });
      return res.json({
        message: "Login UMKM berhasil",
        token,
        role: "umkm",
        umkm_id: umkm.id,
      });
    }

    // ===== 3. CEK ADMIN =====
    const admin = await Admin.findOne({ where: { email } });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(400).json({ message: "Password salah" });

      const token = createToken({ admin_id: admin.id, role: "admin" });
      return res.json({
        message: "Login admin berhasil",
        token,
        role: "admin",
      });
    }

    return res.status(404).json({ message: "Email tidak terdaftar" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Login gagal",
      error: error.message,
    });
  }
};

export const approveUmkm = async (req, res) => {
  try {
    const { id } = req.params;

    const umkm = await Umkm.findByPk(id);
    if (!umkm) {
      return res.status(404).json({
        message: "UMKM tidak ditemukan",
      });
    }

    if (umkm.status === "aktif") {
      return res.status(400).json({
        message: "UMKM sudah aktif",
      });
    }

    umkm.status = "aktif";
    await umkm.save();

    res.json({
      message: "UMKM berhasil di-ACC oleh admin",
      data: {
        id: umkm.id,
        nama_toko: umkm.nama_toko,
        status: umkm.status,
      },
    });
  } catch (error) {
    console.error("Approve UMKM Error:", error);
    res.status(500).json({
      message: "Gagal approve UMKM",
      error: error.message,
    });
  }
};

export const getAllUmkm = async (req, res) => {
  try {
    const umkm = await Umkm.findAll({
      attributes: ["id", "nama_toko", "email", "status"],
      order: [["id", "DESC"]],
    });

    res.json({
      message: "List UMKM",
      data: umkm,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data UMKM",
      error: error.message,
    });
  }
};

export const rejectUmkm = async (req, res) => {
  try {
    const { id } = req.params;

    const umkm = await Umkm.findByPk(id);
    if (!umkm) {
      return res.status(404).json({ message: "UMKM tidak ditemukan" });
    }

    umkm.status = "reject";
    await umkm.save();

    res.json({
      message: "UMKM berhasil direject",
      data: {
        id: umkm.id,
        nama_toko: umkm.nama_toko,
        status: umkm.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal reject UMKM",
      error: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "nama", "email"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);
    res.status(500).json({
      message: "Gagal mengambil data profile",
      error: error.message,
    });
  }
};

export const getMyprofileUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ["nama", "email"],
    });

    if (!user) {
      return res.status(404).json({
        message: "user tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Data profile user",
      data: user,
    });
  } catch (error) {
    console.error("Get My Profile User Error:", error);
    res.status(500).json({
      message: "Gagal mengambil data profile user",
      error: error.message,
    });
  }
};
