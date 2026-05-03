import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Umkm from "./Umkm.js";

const UmkmWithdraw = db.define(
  "umkm_withdraw",
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

    jumlah: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },

    bank: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rekening: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nama_rekening: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    catatan_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  },
);

// 🔥 Relasi
UmkmWithdraw.belongsTo(Umkm, {
  foreignKey: "umkm_id",
});

Umkm.hasMany(UmkmWithdraw, {
  foreignKey: "umkm_id",
});

export default UmkmWithdraw;
