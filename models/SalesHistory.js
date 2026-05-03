import { DataTypes } from "sequelize";
import db from "../config/database.js";

const SalesHistory = db.define(
  "sales_history",
  {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    umkm_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    total_harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ongkir: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    payment_method: {
      type: DataTypes.STRING,
    },

    payment_status: {
      type: DataTypes.STRING,
    },

    selesai_pada: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default SalesHistory;
