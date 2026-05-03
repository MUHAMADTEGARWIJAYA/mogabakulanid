import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Umkm from "./Umkm.js";
const UmkmSaldo = db.define(
  "umkm_saldo",
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
    saldo_tersedia: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    saldo_tertahan: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,

    // 🔥 TAMBAHKAN INI
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
UmkmSaldo.belongsTo(Umkm, {
  foreignKey: "umkm_id",
});

Umkm.hasOne(UmkmSaldo, {
  foreignKey: "umkm_id",
});

export default UmkmSaldo;
