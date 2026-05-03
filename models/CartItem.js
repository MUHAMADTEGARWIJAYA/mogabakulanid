import { DataTypes } from "sequelize";
import db from "../config/database.js";

const CartItem = db.define(
  "cart_items",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default CartItem;
