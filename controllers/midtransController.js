import crypto from "crypto";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import UmkmSaldo from "../models/UmkmSaldo.js";
export const midtransNotification = async (req, res) => {
  try {
    // const notification = req.body;

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      transaction_time,
    } = req.body;

    /**
     * 1️⃣ Validasi signature Midtrans
     */
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const payload = order_id + status_code + gross_amount + serverKey;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(payload)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    /**
     * 2️⃣ Ambil ID order asli
     * Contoh: ORDER-12-172123123
     */
    const orderId = order_id.split("-")[1];

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    /**
     * 3️⃣ Mapping status Midtrans → payment_status
     */
    let payment_status = "pending";

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      payment_status = "paid";
      // ==========================
      // CEK AGAR TIDAK DOUBLE CREDIT
      // ==========================
      if (order.payment_status !== "paid") {
        const totalMasuk = Number(order.total_harga) + Number(order.ongkir);

        let saldo = await UmkmSaldo.findOne({
          where: { umkm_id: order.umkm_id },
        });

        if (!saldo) {
          saldo = await UmkmSaldo.create({
            umkm_id: order.umkm_id,
            saldo_tersedia: 0,
            saldo_tertahan: 0,
          });
        }

        await saldo.update({
          saldo_tertahan: Number(saldo.saldo_tertahan) + totalMasuk,
        });
      }
    } else if (
      transaction_status === "expire" ||
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      payment_status = "failed";
    }

    /**
     * 4️⃣ Update order
     */
    await order.update({
      payment_status,
      midtrans_transaction_status: transaction_status,
      payment_type,
      transaction_time,
    });

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook Midtrans error:", error);
    res.status(500).json({ message: "Webhook error" });
  }
};

export const getDetailOrderUmkm = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        umkm_id: umkmId,
      },
      include: [
        {
          model: OrderItem,
          as: "order_items", // ✅ sesuai relasi
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
        {
          model: User,
          as: "user", // ✅ WAJIB ADA
          attributes: ["id", "nama", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        message: "Order tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Detail order UMKM",
      data: order,
    });
  } catch (error) {
    console.error("Detail Order UMKM Error:", error);
    res.status(500).json({
      message: "Gagal mengambil detail order",
      error: error.message,
    });
  }
};
