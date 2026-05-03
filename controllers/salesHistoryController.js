import { Op } from "sequelize";
import SalesHistory from "../models/SalesHistory.js";

export const getSalesHistory = async (req, res) => {
  try {
    const umkmId = req.user.umkm_id;
    const { filter, month, year } = req.query; // ← Tambah month & year

    const now = new Date();
    let startDate, endDate;

    if (filter === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    if (filter === "month") {
      // ✅ Jika ada parameter month & year, gunakan itu
      if (month && year) {
        const selectedMonth = parseInt(month) - 1; // month 1-12, array 0-11
        const selectedYear = parseInt(year);

        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      } else {
        // Default: bulan ini
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      }
    }

    if (filter === "year") {
      // ✅ Jika ada parameter year, gunakan itu
      const selectedYear = year ? parseInt(year) : now.getFullYear();

      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    }

    const whereClause = {
      umkm_id: umkmId,
    };

    if (startDate && endDate) {
      whereClause.selesai_pada = {
        [Op.between]: [startDate, endDate],
      };
    }

    const sales = await SalesHistory.findAll({
      where: whereClause,
      order: [["selesai_pada", "DESC"]],
    });

    const totalOmzet = sales.reduce((sum, item) => sum + item.total_harga, 0);

    res.status(200).json({
      filter: filter || "all",
      month: month || null,
      year: year || null,
      total_order: sales.length,
      total_omzet: totalOmzet,
      data: sales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengambil sales history" });
  }
};
