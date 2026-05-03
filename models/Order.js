import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Order = db.define(
  "orders",
  {
    user_id: DataTypes.INTEGER,
    umkm_id: DataTypes.INTEGER,

    // =====================
    // IDENTITAS PENERIMA
    // =====================
    nama_penerima: DataTypes.STRING,
    email: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    alamat: DataTypes.TEXT,

    // =====================
    // LOKASI (FOOD DELIVERY)
    // =====================
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    // =====================
    // TIPE ORDER
    // =====================
    order_type: {
      type: DataTypes.ENUM("non-food", "food"),
      defaultValue: "non-food",
    },

    // =====================
    // TOTAL & ONGKIR
    // =====================
    total_harga: DataTypes.INTEGER,
    ongkir: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // =====================
    // PAYMENT
    // =====================
    payment_method: {
      type: DataTypes.ENUM("midtrans", "cod"),
      defaultValue: "midtrans",
    },

    payment_type: DataTypes.STRING,

    payment_status: {
      type: DataTypes.ENUM("pending", "pending_cod", "paid", "failed"),
      defaultValue: "pending",
    },

    // =====================
    // STATUS ORDER
    // =====================
    order_status: {
      type: DataTypes.ENUM(
        "menunggu_konfirmasi",
        "diproses",
        "dikirim",
        "selesai",
        "dibatalkan",
      ),
      defaultValue: "menunggu_konfirmasi",
    },

    cancelled_by: {
      type: DataTypes.ENUM("buyer", "seller"),
      allowNull: true,
    },
    delivery_method: {
      type: DataTypes.ENUM("delivery", "pickup"),
      defaultValue: "delivery",
    },

    cancel_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // provinsi_tujuan_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },

    // kota_tujuan_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    // =====================
    // KONFIRMASI 2 ARAH
    // =====================
    buyer_confirm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    seller_confirm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    kota_tujuan: DataTypes.STRING,
    provinsi_tujuan: DataTypes.STRING,
    total_berat: DataTypes.INTEGER, // gram

    kurir: {
      type: DataTypes.STRING, // jne, jnt, sicepat
    },

    layanan_kurir: {
      type: DataTypes.STRING, // REG, YES, BEST
    },

    estimasi_pengiriman: {
      type: DataTypes.STRING, // 2-3 hari
    },

    // =====================
    // PENGIRIMAN
    // =====================
    no_resi: DataTypes.STRING,

    // =====================
    // MIDTRANS
    // =====================
    midtrans_transaction_status: DataTypes.STRING,
    transaction_time: DataTypes.DATE,
    midtrans_order_id: DataTypes.STRING,
    midtrans_snap_token: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default Order;
