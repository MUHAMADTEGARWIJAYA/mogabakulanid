import { DataTypes } from "sequelize";
import db from "../config/database.js";

const City = db.define(
  "City",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "cities",
    timestamps: false,
  },
);

export default City;
