import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { Op } from "sequelize"; // Import Op untuk query database
import User from "../models/User.js";
import Umkm from "../models/Umkm.js";
// ==============================
// GET CHAT BY ORDER
// ==============================
export const getChatByOrder = async (req, res) => {
  try {
    // Konsisten menggunakan currentId dari user atau umkm
    const currentId = req.user?.id || req.umkm?.id;
    const { order_id } = req.params;

    if (!currentId) {
      return res
        .status(401)
        .json({ msg: "Sesi tidak valid, silakan login kembali" });
    }

    const chat = await Chat.findOne({
      where: { order_id },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "nama", "email"],
        },
        {
          model: Umkm,
          as: "seller",
          attributes: ["id", "nama_toko", "email"],
        },
      ],
    });

    if (!chat) {
      return res
        .status(404)
        .json({ msg: "Chat tidak ditemukan untuk pesanan ini" });
    }

    // Validasi Akses (Konversi ke String untuk keamanan tipe data)
    const loggedInId = String(currentId);
    if (
      loggedInId !== String(chat.buyer_id) &&
      loggedInId !== String(chat.seller_id)
    ) {
      return res
        .status(403)
        .json({ msg: "Anda tidak memiliki izin mengakses chat ini" });
    }

    res.json(chat);
  } catch (error) {
    console.error("Error getChatByOrder:", error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// ==============================
// GET MESSAGES BY CHAT
// ==============================
export const getMessages = async (req, res) => {
  try {
    const currentId = req.user?.id || req.umkm?.id;
    const { chat_id } = req.params;

    if (!currentId) return res.status(401).json({ msg: "Sesi tidak valid" });

    const chat = await Chat.findByPk(chat_id);
    if (!chat) return res.status(404).json({ msg: "Chat tidak ditemukan" });

    const loggedInId = String(currentId);
    if (
      loggedInId !== String(chat.buyer_id) &&
      loggedInId !== String(chat.seller_id)
    ) {
      return res.status(403).json({ msg: "Tidak punya akses ke pesan ini" });
    }

    const messages = await Message.findAll({
      where: { chat_id },
      order: [["created_at", "ASC"]],
    });

    // Tambahkan is_me: true/false berdasarkan currentId
    const result = messages.map((msg) => ({
      ...msg.toJSON(),
      is_me: String(msg.sender_id) === loggedInId,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengambil pesan" });
  }
};

// export const getMessages = async (req, res) => {
//   try {
//     const currentId = req.user?.id || req.umkm?.id;
//     const { chat_id } = req.params;

//     if (!currentId) return res.status(401).json({ msg: "Sesi tidak valid" });

//     const chat = await Chat.findByPk(chat_id);
//     if (!chat) return res.status(404).json({ msg: "Chat tidak ditemukan" });

//     // 🔐 VALIDASI AKSES
//     const loggedInId = String(currentId);
//     if (
//       loggedInId !== String(chat.buyer_id) &&
//       loggedInId !== String(chat.seller_id)
//     ) {
//       return res.status(403).json({ msg: "Tidak punya akses ke pesan ini" });
//     }

//     const messages = await Message.findAll({
//       where: { chat_id },
//       order: [["created_at", "ASC"]],
//     });

//     res.json(messages);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Gagal mengambil pesan" });
//   }
// };

// ==============================
// SEND MESSAGE
// ==============================
export const sendMessage = async (req, res) => {
  try {
    const currentId = req.user?.id || req.umkm?.id;
    const { chat_id, message } = req.body;

    if (!currentId) return res.status(401).json({ msg: "Sesi tidak valid" });
    if (!message || message.trim() === "") {
      return res.status(400).json({ msg: "Pesan tidak boleh kosong" });
    }

    const chat = await Chat.findByPk(chat_id);
    if (!chat) return res.status(404).json({ msg: "Chat tidak ditemukan" });

    // 🔐 VALIDASI AKSES
    const loggedInId = String(currentId);
    if (
      loggedInId !== String(chat.buyer_id) &&
      loggedInId !== String(chat.seller_id)
    ) {
      return res.status(403).json({ msg: "Tidak punya akses mengirim pesan" });
    }

    const newMessage = await Message.create({
      chat_id,
      sender_id: currentId, // Menggunakan ID yang sedang aktif
      message,
      is_read: false,
    });

    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengirim pesan" });
  }
};

// ==============================
// MARK AS READ
// ==============================
export const markAsRead = async (req, res) => {
  try {
    const currentId = req.user?.id || req.umkm?.id;
    const { chat_id } = req.params;

    if (!currentId) return res.status(401).json({ msg: "Sesi tidak valid" });

    const chat = await Chat.findByPk(chat_id);
    if (!chat) return res.status(404).json({ msg: "Chat tidak ditemukan" });

    // 🔐 VALIDASI AKSES
    const loggedInId = String(currentId);
    if (
      loggedInId !== String(chat.buyer_id) &&
      loggedInId !== String(chat.seller_id)
    ) {
      return res.status(403).json({ msg: "Tidak punya akses" });
    }

    // Update pesan yang dikirim oleh LAWAN bicara (bukan currentId)
    await Message.update(
      { is_read: true },
      {
        where: {
          chat_id,
          sender_id: { [Op.ne]: currentId }, // Gunakan operator Not Equal
        },
      },
    );

    res.json({ msg: "Pesan ditandai sudah dibaca" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal update read status" });
  }
};
