import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Cart = db.define(
  "carts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "checkout"),
      defaultValue: "active",
    },
    cart_type: {
      type: DataTypes.ENUM("food", "non-food"),
      allowNull: false,
      defaultValue: "non-food",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default Cart;
