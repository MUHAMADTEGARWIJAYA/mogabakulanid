import { Product, Umkm } from "../models/index.js";
import UmkmSaldo from "../models/UmkmSaldo.js";
import UmkmWithdraw from "../models/UmkmWithdraw.js";
// ================= CREATE =================
export const createProduct = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, stok, tipe, kategori } = req.body;
    const umkmId = req.user.umkm_id;

    const images = req.files?.map((file) => file.filename) || [];

    const product = await Product.create({
      umkm_id: umkmId,
      nama_produk,
      deskripsi,
      harga,
      stok,
      tipe,
      kategori,
      images,
    });

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: product,
    });
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambah produk",
      error: error.message,
    });
  }
};

// ================= GET ALL =================
export const getAllProductsNonFood = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        tipe: "non-food",

        is_active: true,
        // stok: {
        //   [Op.gt]: 0, // hanya tampilkan produk dengan stok > 0
        // },
      },
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko"],
          where: { is_open: true, status: "aktif" }, // ambil nama UMKM
        },
      ],
      order: [
        ["terjual", "DESC"],
        ["created_at", "DESC"],
      ], // urutkan berdasarkan terjual terbanyak, lalu terbaru
    });

    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProductsFood = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        tipe: "food",
        is_active: true,
        // stok: {
        //   [Op.gt]: 0, // hanya tampilkan produk dengan stok > 0
        // },
      },
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko"],
          // where: {
          //   is_open: true, // hanya tampilkan produk dari UMKM yang buka
          //   status: "aktif", // hanya tampilkan produk dari UMKM yang aktif
          // }, // ambil nama UMKM
        },
      ],
      order: [
        ["terjual", "DESC"],
        ["created_at", "DESC"],
      ], // urutkan berdasarkan terjual terbanyak, lalu terbaru
    });

    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE =================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const umkmId = req.user.umkm_id;

    const product = await Product.findByPk(id);
    if (!product)
      return res.status(404).json({ message: "Produk tidak ditemukan" });

    if (product.umkm_id !== umkmId)
      return res.status(403).json({ message: "Bukan pemilik produk" });

    const images = req.files?.map((file) => file.filename);

    await product.update({
      ...req.body,
      images: images && images.length > 0 ? images : product.images,
    });

    res.json({ message: "Produk berhasil diupdate", data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DELETE =================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, umkm_id } = req.user;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // UMKM hanya boleh hapus produk miliknya
    if (role === "umkm" && product.umkm_id !== umkm_id) {
      return res.status(403).json({ message: "Bukan pemilik produk" });
    }

    await product.update({ is_active: false });

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getDetailProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko", "status"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    res.json({
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail produk",
      error: error.message,
    });
  }
};

export const getProductsByUmkm = async (req, res) => {
  try {
    const { umkmId } = req.params;

    const products = await Product.findAll({
      where: {
        umkm_id: umkmId,
        is_active: true,
      },
      include: [
        {
          model: Umkm,
          as: "umkm", // WAJIB sama dengan association
          attributes: ["id", "nama_toko", "status", "alamat", "email"],
        },
      ],
    });

    res.json({
      message: "Berhasil mengambil produk UMKM",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil produk UMKM",
      error: error.message,
    });
  }
};

// ================= GET MY PRODUCTS (UMKM) =================
export const getMyProducts = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id; // id UMKM dari token

    const products = await Product.findAll({
      where: {
        umkm_id: umkmId,
        is_active: true,
      },
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko"],
        },
      ],
    });

    res.json({
      message: "Berhasil mengambil produk UMKM",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil produk UMKM",
      error: error.message,
    });
  }
};

export const toggleToko = async (req, res) => {
  try {
    const umkm = await Umkm.findByPk(req.user.umkm_id);

    if (!umkm) {
      return res.status(404).json({ msg: "UMKM tidak ditemukan" });
    }

    umkm.is_open = !umkm.is_open;
    await umkm.save();

    res.json({
      msg: `Toko berhasil ${umkm.is_open ? "dibuka" : "ditutup"}`,
      is_open: umkm.is_open,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan" });
  }
};
export const getIsOpen = async (req, res) => {
  try {
    const umkmId = req.user?.umkm_id;

    if (!umkmId) {
      return res.status(401).json({
        msg: "Unauthorized - UMKM tidak ditemukan di token",
      });
    }

    const umkm = await Umkm.findByPk(umkmId, {
      attributes: ["id", "nama_toko", "is_open", "createdAt"],
    });

    if (!umkm) {
      return res.status(404).json({
        msg: "UMKM tidak ditemukan",
      });
    }

    res.status(200).json({
      msg: "Data UMKM berhasil diambil",
      data: umkm,
    });
  } catch (error) {
    console.error("Get My UMKM Error:", error);
    res.status(500).json({
      msg: "Terjadi kesalahan server",
    });
  }
};

export const requestWithdraw = async (req, res) => {
  try {
    const umkm_id = req.user.umkm_id; // dari middleware auth
    const { jumlah, bank, rekening, nama_rekening } = req.body;

    const saldo = await UmkmSaldo.findOne({
      where: { umkm_id },
    });

    if (!saldo) {
      return res.status(404).json({ message: "Saldo tidak ditemukan" });
    }

    if (Number(jumlah) > Number(saldo.saldo_tersedia)) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    const withdraw = await UmkmWithdraw.create({
      umkm_id,
      jumlah,
      bank,
      rekening,
      nama_rekening,
      status: "pending",
    });

    res.json({
      message: "Pengajuan withdraw berhasil",
      data: withdraw,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveWithdraw = async (req, res) => {
  try {
    const { id } = req.params; // id withdraw

    const withdraw = await UmkmWithdraw.findByPk(id);

    if (!withdraw) {
      return res.status(404).json({ message: "Withdraw tidak ditemukan" });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({ message: "Withdraw sudah diproses" });
    }

    const saldo = await UmkmSaldo.findOne({
      where: { umkm_id: withdraw.umkm_id },
    });

    if (Number(withdraw.jumlah) > Number(saldo.saldo_tersedia)) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    // 🔥 Kurangi saldo
    await saldo.update({
      saldo_tersedia: Number(saldo.saldo_tersedia) - Number(withdraw.jumlah),
    });

    // 🔥 Update status withdraw
    await withdraw.update({
      status: "approved",
    });

    res.json({
      message: "Withdraw disetujui. Silakan transfer manual.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_admin } = req.body;

    const withdraw = await UmkmWithdraw.findByPk(id);

    if (!withdraw) {
      return res.status(404).json({ message: "Withdraw tidak ditemukan" });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({ message: "Withdraw sudah diproses" });
    }

    await withdraw.update({
      status: "rejected",
      catatan_admin,
    });

    res.json({ message: "Withdraw ditolak" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMySaldo = async (req, res) => {
  try {
    const umkm_id = req.user.umkm_id; // dari middleware auth

    const saldo = await UmkmSaldo.findOne({
      where: { umkm_id },
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko", "email"],
        },
      ],
    });

    if (!saldo) {
      return res.status(404).json({
        message: "Saldo tidak ditemukan",
      });
    }

    res.json({
      message: "Saldo berhasil diambil",
      data: saldo,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getAllSaldo = async (req, res) => {
  try {
    const saldos = await UmkmSaldo.findAll({
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko", "email", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      message: "Semua saldo berhasil diambil",
      total: saldos.length,
      data: saldos,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getAllWithdraw = async (req, res) => {
  try {
    const withdraws = await UmkmWithdraw.findAll({
      include: [
        {
          model: Umkm,
          attributes: ["id", "nama_toko"],
        },
      ],
      // order: [["created_at", "DESC"]],
    });

    res.json({
      message: "Data withdraw berhasil diambil",
      data: withdraws,
    });
  } catch (error) {
    console.error("Get All Withdraw Error:", error);
    res.status(500).json({ error: error.message });
  }
};
