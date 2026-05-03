import bcrypt from "bcrypt";
import db from "./config/database.js";
import Umkm from "./models/Umkm.js";

const seedUMKM = async () => {
  try {
    await db.authenticate();
    console.log("Database connected...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    const baseLatitude = -7.1;
    const baseLongitude = 109.25;

    const umkmData = [];

    for (let i = 1; i <= 20; i++) {
      umkmData.push({
        provinsi_id: 33,
        kota_id: 3327, // Pemalang
        nama_toko: `UMKM Moga ${i}`,
        email: `umkm${i}@moga.com`,
        password: hashedPassword,
        alamat: `Jl. Raya Moga No ${i}, Kecamatan Moga`,
        kota: "Pemalang",
        provinsi: "Jawa Tengah",
        latitude: baseLatitude + Math.random() * 0.01,
        longitude: baseLongitude + Math.random() * 0.01,
        is_open: true,
        status: "aktif",
      });
    }

    await Umkm.bulkCreate(umkmData);

    console.log("✅ 20 UMKM Kecamatan Moga berhasil ditambahkan");
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

seedUMKM();
