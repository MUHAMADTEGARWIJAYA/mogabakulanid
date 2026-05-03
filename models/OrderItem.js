import { DataTypes } from "sequelize";
import db from "../config/database.js";

const OrderItem = db.define(
  "order_items",
  {
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,

    nama_produk: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    qty: DataTypes.INTEGER,
    subtotal: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default OrderItem;
