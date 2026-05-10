import db from "./config/database.js";
import Product from "./models/Product.js";

const seedProducts = async () => {
  try {
    await db.sync(); // pastikan koneksi jalan

    await Product.bulkCreate([
      {
        umkm_id: 23,
        nama_produk: "salad buah 300ml 10k",
        deskripsi:
          "Salad buah segar dengan campuran buah-buahan pilihan, disajikan dalam kemasan 300ml yang praktis dan lezat",
        harga: 10000,
        stok: 50,
        tipe: "food",
        kategori: "makanan",
        images: ["saladbuah1.jpg"],
        is_active: true,
      },
      {
        umkm_id: 23,
        nama_produk: "Salad buah 500ml 18k ",
        deskripsi:
          "Salad buah segar dengan campuran buah-buahan pilihan, disajikan dalam kemasan 500ml yang praktis dan lezat",
        harga: 18000,
        stok: 40,
        tipe: "food",
        kategori: "makanan",
        images: ["saladbuah2.jpg"],
        is_active: true,
      },
      // {
      //   umkm_id: 21,
      //   nama_produk: "Bucket Custom 15k",
      //   deskripsi:
      //     "Bucket Custom dengan harga terjangkau, cocok untuk berbagai acara dan kebutuhan makan bersama",
      //   harga: 15000,
      //   stok: 30,
      //   tipe: "non-food",
      //   kategori: "makanan",
      //   images: ["bucket3.jpg"],
      //   is_active: true,
      // },
    ]);

    console.log("✅ Seeder produk Kedai Mama Putri berhasil!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeder gagal:", error);
    process.exit(1);
  }
};

seedProducts();
