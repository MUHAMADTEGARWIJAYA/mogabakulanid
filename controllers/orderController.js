import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import axios from "axios";
import Order from "../models/Order.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";
import UmkmSaldo from "../models/UmkmSaldo.js";
import { snap } from "../config/midtrans.js";
import Umkm from "../models/Umkm.js";
import db from "../config/database.js";
import { insertSalesHistoryIfNotExists } from "../config/insertSalesHistory.js";
import { Op } from "sequelize";
import Chat from "../models/Chat.js";
// Fungsi pembantu untuk menghitung jarak antara dua koordinat (dalam KM)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      nama,
      email,
      no_hp,
      alamat,
      ongkir = 10000,
      payment_method = "midtrans",
      delivery_method = "delivery", // NEW
      latitude = null,
      longitude = null,
    } = req.body;

    // 1. GET CART
    const cart = await Cart.findOne({
      where: { user_id: userId, status: "active" },
      include: [
        {
          model: CartItem,
          as: "cart_items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!cart || cart.cart_items.length === 0) {
      return res.status(400).json({ msg: "Keranjang kosong" });
    }

    // 2. VALIDASI PRODUK AKTIF
    const inactiveProducts = cart.cart_items.filter(
      (item) => !item.product || item.product.is_active !== true,
    );

    if (inactiveProducts.length > 0) {
      return res.status(400).json({
        msg: "Terdapat produk yang sudah tidak aktif",
      });
    }

    // ==========================
    // AREA VALIDATION
    // ==========================

    const MOGA_CENTER = {
      lat: -7.1534,
      lng: 109.2991,
    };

    const MAX_RADIUS_KM = 15; // Batasi maksimal 15 KM dari pusat Moga

    let isInsideMoga = false;
    let distance = 0;

    if (latitude && longitude) {
      distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        MOGA_CENTER.lat,
        MOGA_CENTER.lng,
      );

      if (distance <= MAX_RADIUS_KM) {
        isInsideMoga = true;
      }
    }

    // ==========================
    // DELIVERY METHOD VALIDATION
    // ==========================

    // 🔵 PICKUP hanya di area Moga
    if (delivery_method === "pickup") {
      if (!isInsideMoga) {
        return res.status(400).json({
          msg: "Pickup hanya tersedia di area Kecamatan Moga",
        });
      }
    }

    // 🔵 FOOD harus di area Moga (baik pickup/delivery)
    if (cart.cart_type === "food") {
      if (!isInsideMoga) {
        return res.status(400).json({
          msg: `Pesanan makanan hanya tersedia di area Kecamatan Moga (Max ${MAX_RADIUS_KM} km)`,
        });
      }
    }

    // 🔵 NON-FOOD luar Moga tidak bisa pickup
    if (
      cart.cart_type === "non-food" &&
      delivery_method === "pickup" &&
      !isInsideMoga
    ) {
      return res.status(400).json({
        msg: "Produk non-food hanya bisa pickup di area Moga",
      });
    }

    // ==========================
    // COD VALIDATION
    // ==========================

    if (payment_method === "cod") {
      // COD hanya untuk area Moga
      if (!isInsideMoga) {
        return res.status(400).json({
          msg: "COD hanya tersedia di area Kecamatan Moga",
        });
      }
    }

    // ==========================
    // ONGKIR LOGIC
    // ==========================

    let finalOngkir = Number(ongkir);

    if (delivery_method === "pickup") {
      finalOngkir = 0;
    }

    // ==========================
    // HITUNG TOTAL
    // ==========================

    let totalProduk = 0;
    const umkmId = cart.cart_items[0].product.umkm_id;

    cart.cart_items.forEach((item) => {
      totalProduk += item.qty * item.product.harga;
    });

    const totalBayar = totalProduk + finalOngkir;

    // ==========================
    // CREATE ORDER
    // ==========================

    const order = await Order.create({
      user_id: userId,
      umkm_id: umkmId,
      nama_penerima: nama,
      email,
      no_hp,
      alamat,
      latitude,
      longitude,
      order_type: cart.cart_type,
      delivery_method,
      total_harga: totalProduk,
      ongkir: finalOngkir,
      payment_method,
      payment_status: payment_method === "cod" ? "pending_cod" : "pending",
      order_status: "menunggu_konfirmasi",
    });

    // CREATE CHAT
    await Chat.create({
      order_id: order.id,
      buyer_id: userId,
      seller_id: umkmId,
    });

    // CREATE ORDER ITEMS
    for (const item of cart.cart_items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        nama_produk: item.product.nama_produk,
        harga: item.product.harga,
        qty: item.qty,
        subtotal: item.qty * item.product.harga,
      });
    }

    // ==========================
    // MIDTRANS
    // ==========================

    let snapToken = null;

    if (payment_method === "midtrans") {
      const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;

      const snapResponse = await snap.createTransaction({
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: totalBayar,
        },
        customer_details: {
          first_name: nama,
          email,
          phone: no_hp,
        },
      });

      await order.update({
        midtrans_order_id: midtransOrderId,
        midtrans_snap_token: snapResponse.token,
      });

      snapToken = snapResponse.token;
    }

    // NONAKTIFKAN CART
    await cart.update({ status: "inactive" });

    res.json({
      message: "Checkout berhasil",
      order_id: order.id,
      snap_token: snapToken,
      total_bayar: totalBayar,
      delivery_method,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Checkout gagal" });
  }
};

// export const checkout = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       nama,
//       email,
//       no_hp,
//       alamat,
//       ongkir = 10000,
//       payment_method = "midtrans",
//       latitude = null,
//       longitude = null,
//     } = req.body;

//     // 1. GET CART
//     const cart = await Cart.findOne({
//       where: { user_id: userId, status: "active" },
//       include: [
//         {
//           model: CartItem,
//           as: "cart_items",
//           include: [{ model: Product, as: "product" }],
//         },
//       ],
//     });

//     if (!cart || cart.cart_items.length === 0) {
//       return res.status(400).json({ msg: "Keranjang kosong" });
//     }

//     // 2. VALIDASI PRODUK AKTIF
//     const inactiveProducts = cart.cart_items.filter(
//       (item) => !item.product || item.product.is_active !== true,
//     );

//     if (inactiveProducts.length > 0) {
//       return res.status(400).json({
//         msg: "Terdapat produk yang sudah tidak aktif",
//         products: inactiveProducts.map((item) => ({
//           product_id: item.product_id,
//           nama_produk: item.product?.nama_produk,
//         })),
//       });
//     }

//     // 3. VALIDASI LOKASI & RADIUS (KHUSUS FOOD)
//     if (cart.cart_type === "food") {
//       if (!latitude || !longitude) {
//         return res
//           .status(400)
//           .json({ msg: "Lokasi wajib diisi untuk pesanan food" });
//       }

//       // Koordinat Pusat Kecamatan Moga (Hasil Google Maps)
//       const MOGA_CENTER = {
//         lat: -7.1534,
//         lng: 109.2991,
//       };

//       const MAX_RADIUS_KM = 8; // Batasi maksimal 8 KM dari pusat Moga

//       const distance = calculateDistance(
//         parseFloat(latitude),
//         parseFloat(longitude),
//         MOGA_CENTER.lat,
//         MOGA_CENTER.lng,
//       );

//       if (distance > MAX_RADIUS_KM) {
//         return res.status(400).json({
//           msg: `Lokasi Anda terlalu jauh (${distance.toFixed(1)} km). Pesanan makanan hanya tersedia di area Kecamatan Moga (Max ${MAX_RADIUS_KM}km).`,
//         });
//       }
//     }

//     // 4. VALIDASI NON-FOOD TIDAK BOLEH COD
//     if (cart.cart_type === "non-food" && payment_method === "cod") {
//       return res.status(400).json({
//         msg: "Metode pembayaran COD hanya tersedia untuk kategori makanan",
//       });
//     }

//     // 5. HITUNG TOTAL
//     let totalProduk = 0;
//     const umkmId = cart.cart_items[0].product.umkm_id;

//     cart.cart_items.forEach((item) => {
//       totalProduk += item.qty * item.product.harga;
//     });

//     const totalBayar = totalProduk + Number(ongkir);

//     // 6. CREATE ORDER
//     const order = await Order.create({
//       user_id: userId,
//       umkm_id: umkmId,
//       nama_penerima: nama,
//       email,
//       no_hp,
//       alamat,
//       latitude: cart.cart_type === "food" ? latitude : null,
//       longitude: cart.cart_type === "food" ? longitude : null,
//       order_type: cart.cart_type,
//       total_harga: totalProduk,
//       ongkir,
//       payment_method,
//       payment_status: payment_method === "cod" ? "pending_cod" : "pending",
//       order_status: "menunggu_konfirmasi",
//     });

//     // 7. CREATE ORDER ITEMS
//     for (const item of cart.cart_items) {
//       await OrderItem.create({
//         order_id: order.id,
//         product_id: item.product_id,
//         nama_produk: item.product.nama_produk,
//         harga: item.product.harga,
//         qty: item.qty,
//         subtotal: item.qty * item.product.harga,
//       });
//     }

//     // 8. MIDTRANS (Jika Bukan COD)
//     let snapToken = null;
//     if (payment_method === "midtrans") {
//       const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
//       const snapResponse = await snap.createTransaction({
//         transaction_details: {
//           order_id: midtransOrderId,
//           gross_amount: totalBayar,
//         },
//         customer_details: {
//           first_name: nama,
//           email,
//           phone: no_hp,
//         },
//       });

//       await order.update({
//         midtrans_order_id: midtransOrderId,
//         midtrans_snap_token: snapResponse.token,
//       });
//       snapToken = snapResponse.token;
//     }

//     // 9. NONAKTIFKAN CART
//     await cart.update({ status: "inactive" });

//     res.json({
//       message: "Checkout berhasil",
//       order_id: order.id,
//       snap_token: snapToken,
//       total_bayar: totalBayar,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Checkout gagal" });
//   }
// };

export const inputResi = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { no_resi } = req.body;
    const umkmId = req.user.umkm_id;

    const order = await Order.findOne({
      where: { id: orderId, umkm_id: umkmId },
    });

    if (!order) {
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }

    await order.update({ no_resi });

    res.json({ msg: "Nomor resi berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ msg: "Gagal menambahkan resi" });
  }
};

export const getOrdersUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]], // 🔥 FIX DI SINI
      include: [
        {
          model: OrderItem,
          as: "order_items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "nama_produk", "harga", "images"],
            },
          ],
        },
        {
          model: Umkm,
          as: "umkm",
          attributes: ["id", "nama_toko"],
        },
      ],
    });

    const result = orders.map((order) => ({
      order_id: order.id,
      // payment_status: order.payment_status,
      // midtrans_status: order.midtrans_transaction_status,
      // nama_penerima: order.nama_penerima,
      alamat: order.alamat,
      umkm: order.umkm,
      total_produk: order.total_harga,
      ongkir: order.ongkir,
      total_bayar: order.total_harga + order.ongkir,
      created_at: order.created_at, // 🔥 BUKAN createdAt
      order_status: order.order_status,
      // payment_status: order.payment_status,
      // buyer_confirm: order.buyer_confirm,
      // seller_confirm: order.seller_confirm,
      // payment_method: order.payment_method,
      items: order.order_items.map((item) => {
        let images = [];

        if (item.product?.images) {
          images =
            typeof item.product.images === "string"
              ? JSON.parse(item.product.images)
              : item.product.images;
        }

        return {
          product_id: item.product_id,
          nama_produk: item.nama_produk,
          harga: item.harga,
          qty: item.qty,
          subtotal: item.subtotal,
          image: images.length > 0 ? images[0] : null, // ✅ FIX
        };
      }),
    }));

    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data order",
    });
  }
};

export const confirmOrderByBuyer = async (req, res) => {
  const t = await db.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }

    if (order.order_status !== "dikirim") {
      await t.rollback();
      return res.status(400).json({
        msg: "Pesanan belum dikirim oleh penjual",
      });
    }

    if (order.buyer_confirm) {
      await t.rollback();
      return res.status(400).json({
        msg: "Pesanan sudah dikonfirmasi",
      });
    }

    // ✅ buyer confirm
    order.buyer_confirm = true;
    order.order_status = "selesai";

    // 💰 COD auto paid
    if (order.payment_method === "cod") {
      order.payment_status = "paid";
    }

    // 🧾 insert sales history
    await insertSalesHistoryIfNotExists(order, t);

    // ===========================
    // 📦 UPDATE JUMLAH TERJUAL
    // ===========================

    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      transaction: t,
    });

    for (const item of orderItems) {
      await Product.increment(
        { terjual: item.quantity },
        {
          where: { id: item.product_id },
          transaction: t,
        },
      );
    }

    // ===========================
    // 💰 PINDAHKAN SALDO TERTAHAN → TERSEDIA
    // ===========================
    if (order.payment_status === "paid") {
      const totalMasuk = Number(order.total_harga) + Number(order.ongkir);

      const saldo = await UmkmSaldo.findOne({
        where: { umkm_id: order.umkm_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!saldo) {
        throw new Error("Saldo UMKM tidak ditemukan");
      }

      if (Number(saldo.saldo_tertahan) < totalMasuk) {
        throw new Error("Saldo tertahan tidak cukup");
      }

      await saldo.update(
        {
          saldo_tertahan: Number(saldo.saldo_tertahan) - totalMasuk,
          saldo_tersedia: Number(saldo.saldo_tersedia) + totalMasuk,
        },
        { transaction: t },
      );
    }

    await order.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      msg: "Pesanan berhasil diselesaikan",
      status: order.order_status,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const confirmOrderBySeller = async (req, res) => {
  const t = await db.transaction();

  try {
    const umkmId = req.user.umkm_id;
    const { id } = req.params;
    const { action } = req.body; // process | ship | complete

    const order = await Order.findOne({
      where: { id, umkm_id: umkmId },
      include: [{ model: OrderItem, as: "order_items" }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }

    // VALIDASI PEMBAYARAN
    if (
      action === "process" &&
      order.payment_method === "midtrans" &&
      order.payment_status !== "paid"
    ) {
      await t.rollback();
      return res.status(400).json({
        msg: "Pembeli belum menyelesaikan pembayaran",
      });
    }

    // ======================
    // 1️⃣ PROSES PESANAN
    // ======================
    if (action === "process") {
      if (order.order_status !== "menunggu_konfirmasi") {
        throw new Error("Pesanan tidak bisa diproses");
      }

      // 🔥 KURANGI STOK SEKALI SAJA
      for (const item of order.order_items) {
        const product = await Product.findOne({
          where: { id: item.product_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!product) throw new Error("Produk tidak ditemukan");
        if (product.stok < item.qty)
          throw new Error(`Stok ${product.nama_produk} tidak mencukupi`);

        product.stok -= item.qty;
        await product.save({ transaction: t });
      }

      order.order_status = "diproses";
      order.seller_confirm = true;
    }

    // ======================
    // 2️⃣ KIRIM PESANAN
    // ======================
    else if (action === "ship") {
      if (order.order_status !== "diproses") {
        throw new Error("Pesanan belum diproses");
      }

      order.order_status = "dikirim";
    }

    // ======================
    // 3️⃣ SELESAIKAN PESANAN
    // ======================
    // else if (action === "complete") {
    //   if (order.order_status !== "dikirim") {
    //     throw new Error("Pesanan belum dikirim");
    //   }

    //   order.order_status = "selesai";
    //   await insertSalesHistoryIfNotExists(order, t);
    // } else {
    //   throw new Error("Action tidak valid");
    // }

    await order.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      msg: "Status pesanan berhasil diperbarui",
      status: order.order_status,
    });
  } catch (error) {
    await t.rollback();
    console.error(error.message);

    res.status(400).json({
      msg: error.message || "Gagal update status",
    });
  }
};

export const getIncomingOrdersFoodUmkm = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id;

    const orders = await Order.findAll({
      where: {
        umkm_id: umkmId,
        order_type: "food", // 🔥 FILTER FOOD
        order_status: {
          [Op.in]: ["menunggu_konfirmasi", "pending", "diproses", "dikirim"],
        },
      },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      msg: "Daftar pesanan FOOD masuk UMKM",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getIncomingOrdersNonFoodUmkm = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id;

    const orders = await Order.findAll({
      where: {
        umkm_id: umkmId,
        order_type: "non-food", // 🔥 FILTER NON-FOOD
        order_status: {
          [Op.in]: ["menunggu_konfirmasi", "pending", "diproses", "dikirim"],
        },
      },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      msg: "Daftar pesanan NON-FOOD masuk UMKM",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getOrderHistoryUmkm = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id;

    const orders = await Order.findAll({
      where: {
        umkm_id: umkmId,
        order_status: ["selesai", "dibatalkan"],
      },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      msg: "Histori pesanan UMKM",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getDetailOrderUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Ambil ID order dari URL /orders/:id

    const order = await Order.findOne({
      where: {
        id: id,
        user_id: userId, // Pastikan user hanya bisa buka order miliknya sendiri
      },
      include: [
        {
          model: OrderItem,
          as: "order_items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "nama_produk", "harga", "images"],
            },
          ],
        },
        {
          model: Umkm,
          as: "umkm",
          attributes: ["id", "nama_toko", "alamat"],
        },
      ],
    });

    // Jika order tidak ditemukan
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Mapping data ke format yang bersih untuk UI
    const result = {
      order_id: order.id,
      nama_penerima: order.nama_penerima,
      no_hp: order.no_hp,
      alamat: order.alamat,
      umkm: order.umkm,
      total_produk: order.total_harga,
      ongkir: order.ongkir,
      total_bayar: order.total_harga + order.ongkir,
      created_at: order.created_at,
      order_status: order.order_status,
      payment_status: order.payment_status,
      buyer_confirm: order.buyer_confirm,
      no_resi: order.no_resi,
      cancelled_by: order.cancelled_by,
      cancel_reason: order.cancel_reason,
      cancelled_at: order.cancelled_at,
      seller_confirm: order.seller_confirm,
      payment_method: order.payment_method,
      items: order.order_items.map((item) => {
        let images = [];
        if (item.product?.images) {
          images =
            typeof item.product.images === "string"
              ? JSON.parse(item.product.images)
              : item.product.images;
        }

        return {
          product_id: item.product_id,
          nama_produk: item.nama_produk,
          harga: item.harga,
          qty: item.qty,
          subtotal: item.subtotal,
          image: images.length > 0 ? images[0] : null,
        };
      }),
    };

    // Kirim objek tunggal (bukan array)
    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil detail order" });
  }
};

export const cancelOrderByBuyer = async (req, res) => {
  const t = await db.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      where: { id, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }

    if (order.order_status !== "menunggu_konfirmasi") {
      await t.rollback();
      return res.status(400).json({
        msg: "Pesanan tidak bisa dibatalkan",
      });
    }

    // ❗ Midtrans masih pending → aman cancel
    order.order_status = "dibatalkan";
    order.cancelled_by = "buyer";
    order.cancel_reason = reason || "Dibatalkan oleh pembeli";
    order.cancelled_at = new Date();

    await order.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      msg: "Pesanan berhasil dibatalkan",
      status: order.order_status,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const cancelOrderBySeller = async (req, res) => {
  const t = await db.transaction();
  try {
    const umkmId = req.user.umkm_id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      where: { id, umkm_id: umkmId },
      include: [{ model: OrderItem, as: "order_items" }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: "Order tidak ditemukan" });
    }

    if (!["menunggu_konfirmasi", "diproses"].includes(order.order_status)) {
      await t.rollback();
      return res.status(400).json({
        msg: "Pesanan tidak bisa dibatalkan",
      });
    }

    // 🔥 KEMBALIKAN STOK JIKA SUDAH DIPROSES
    if (order.order_status === "diproses") {
      for (const item of order.order_items) {
        const product = await Product.findOne({
          where: { id: item.product_id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (product) {
          product.stok += item.qty;
          await product.save({ transaction: t });
        }
      }
    }

    order.order_status = "dibatalkan";
    order.cancelled_by = "seller";
    order.cancel_reason = reason || "Pesanan ditolak penjual";
    order.cancelled_at = new Date();

    await order.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      msg: "Pesanan berhasil dibatalkan",
      status: order.order_status,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
