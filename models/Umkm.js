import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Umkm = db.define(
  "umkm",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    provinsi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    kota_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    nama_toko: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    alamat: {
      type: DataTypes.TEXT,
      allowNull: true, // 🔥 boleh null dulu, isi nanti
    },
    kota: DataTypes.STRING,
    provinsi: DataTypes.STRING,

    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "aktif", "tutup", "reject"),
      defaultValue: "pending",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

export default Umkm;
