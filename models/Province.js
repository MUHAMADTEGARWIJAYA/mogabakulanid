import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Province = db.define(
  "Province",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "provinces",
    timestamps: false,
  },
);

export default Province;
