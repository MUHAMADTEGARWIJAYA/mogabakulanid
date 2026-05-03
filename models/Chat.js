import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Chat = db.define(
  "chats",
  {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default Chat;
