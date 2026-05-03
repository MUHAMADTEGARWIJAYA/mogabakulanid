import db from "./config/database.js";
import Product from "./models/Product.js";

const seedProducts = async () => {
  try {
    await db.sync(); // pastikan koneksi jalan

    await Product.bulkCreate([
      {
        umkm_id: 14,
        nama_produk: "Nasi Goreng Spesial",
        deskripsi: "Nasi goreng dengan bahan-bahan segar dan rasa yang lezat",
        harga: 15000,
        stok: 50,
        tipe: "food",
        kategori: "makanan",
        images: ["nasi1.jpg"],
        is_active: true,
      },
      {
        umkm_id: 14,
        nama_produk: "Nasi Ayam Bakar",
        deskripsi:
          "Nasi ayam bakar dengan bumbu rempah yang lezat, cocok untuk lauk pendamping nasi",
        harga: 16000,
        stok: 30,
        tipe: "food",
        kategori: "makanan",
        images: ["nasiayam.jpg"],
        is_active: true,
      },
    ]);

    console.log("✅ Seeder produk Kedai Mama Putri berhasil!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeder gagal:", error);
    process.exit(1);
  }
};

seedProducts();
