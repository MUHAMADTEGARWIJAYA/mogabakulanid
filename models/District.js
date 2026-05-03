import { DataTypes } from "sequelize";
import db from "../config/database.js";

const District = db.define(
  "District",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "districts",
    timestamps: false,
  },
);

export default District;
