import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Product = db.define(
  "products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    umkm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stok: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: false,
      enum: ["food", "non-food"],
    },
    terjual: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
      enum: ["makanan", "minuman", "lainnya"],
    },

    images: {
      type: DataTypes.JSON, // simpan array nama file
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

export default Product;
