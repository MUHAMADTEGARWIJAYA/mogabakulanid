import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import Umkm from "../models/Umkm.js";
// export const addToCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { product_id, qty } = req.body;

//     // 1. cek produk
//     const product = await Product.findByPk(product_id);
//     if (!product) {
//       return res.status(404).json({ msg: "Produk tidak ditemukan" });
//     }

//     // 2. cari cart aktif
//     let cart = await Cart.findOne({
//       where: {
//         user_id: userId,
//         status: "active",
//       },
//     });

//     // 3. buat cart jika belum ada
//     if (!cart) {
//       cart = await Cart.create({
//         user_id: userId,
//         status: "active",
//       });
//     }

//     // 4. cek apakah cart sudah ada item dari UMKM lain
//     const existingItem = await CartItem.findOne({
//       where: { cart_id: cart.id },
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["umkm_id"],
//         },
//       ],
//     });

//     if (
//       existingItem &&
//       existingItem.product &&
//       existingItem.product.umkm_id !== product.umkm_id
//     ) {
//       return res.status(400).json({
//         msg: "Keranjang hanya boleh berisi produk dari satu toko (UMKM)",
//       });
//     }

//     // 5. cek produk di cart
//     let cartItem = await CartItem.findOne({
//       where: {
//         cart_id: cart.id,
//         product_id,
//       },
//     });

//     // 6. update qty jika sudah ada
//     if (cartItem) {
//       cartItem.qty += qty ? qty : 1;
//       await cartItem.save();
//     }
//     // 7. insert jika belum ada
//     else {
//       await CartItem.create({
//         cart_id: cart.id,
//         product_id,
//         qty: qty ? qty : 1,
//       });
//     }

//     return res.status(200).json({
//       msg: "Produk berhasil ditambahkan ke keranjang",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getCartUser = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // cari cart aktif user
//     const cart = await Cart.findOne({
//       where: {
//         user_id: userId,
//         status: "active",
//       },
//       include: [
//         {
//           model: CartItem,
//           as: "cart_items",
//           include: [
//             {
//               model: Product,
//               as: "product",
//               include: [
//                 {
//                   model: Umkm,
//                   as: "umkm",
//                   attributes: ["id", "nama_toko"],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     });

//     if (!cart) {
//       return res.status(200).json({
//         message: "Keranjang kosong",
//         data: [],
//         totalHarga: 0,
//       });
//     }

//     // hitung subtotal & total
//     let totalHarga = 0;

//     const items = cart.cart_items.map((item) => {
//       const harga = item.product.harga;
//       const qty = item.qty;
//       const subtotal = harga * qty;

//       totalHarga += subtotal;

//       return {
//         cart_item_id: item.id,
//         product_id: item.product.id,
//         nama_produk: item.product.nama_produk,
//         harga,
//         qty,
//         subtotal,
//         images: item.product.images,
//         umkm: item.product.umkm,
//       };
//     });

//     res.status(200).json({
//       cart_id: cart.id,
//       items,
//       totalHarga,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Gagal mengambil cart" });
//   }
// };

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, qty } = req.body;

    // 1. cek produk
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    // 2. cari cart aktif
    let cart = await Cart.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
    });

    // 3. buat cart jika belum ada
    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        status: "active",
        cart_type: product.tipe, // 🔥 LOCK DARI PRODUK
      });
    }

    // 4. cek cart_type (food vs non-food)
    if (cart.cart_type !== product.tipe) {
      return res.status(400).json({
        msg: "Keranjang hanya boleh berisi produk food atau non-food",
      });
    }

    // 5. cek UMKM (hanya 1 toko)
    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["umkm_id"],
        },
      ],
    });

    if (
      existingItem &&
      existingItem.product &&
      existingItem.product.umkm_id !== product.umkm_id
    ) {
      return res.status(400).json({
        msg: "Keranjang hanya boleh berisi produk dari satu toko (UMKM)",
      });
    }

    // 6. cek produk di cart
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id,
      },
    });

    // 7. update qty / insert
    if (cartItem) {
      cartItem.qty += qty ? qty : 1;
      await cartItem.save();
    } else {
      await CartItem.create({
        cart_id: cart.id,
        product_id,
        qty: qty ? qty : 1,
      });
    }

    return res.status(200).json({
      msg: "Produk berhasil ditambahkan ke keranjang",
      cart_type: cart.cart_type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCartUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
      include: [
        {
          model: CartItem,
          as: "cart_items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                {
                  model: Umkm,
                  as: "umkm",
                  attributes: ["id", "nama_toko"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(200).json({
        message: "Keranjang kosong",
        cart_type: null,
        data: [],
        totalHarga: 0,
      });
    }

    let totalHarga = 0;

    const items = cart.cart_items.map((item) => {
      const harga = item.product.harga;
      const qty = item.qty;
      const subtotal = harga * qty;

      totalHarga += subtotal;

      return {
        cart_item_id: item.id,
        product_id: item.product.id,
        nama_produk: item.product.nama_produk,
        harga,
        qty,
        subtotal,
        images: item.product.images,
        umkm: item.product.umkm,
      };
    });

    res.status(200).json({
      cart_id: cart.id,
      cart_type: cart.cart_type, // 🔥 penting
      items,
      totalHarga,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal mengambil cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart_item_id, qty } = req.body;

    if (qty < 1) {
      return res.status(400).json({ message: "Qty minimal 1" });
    }

    // cari cart aktif user
    const cart = await Cart.findOne({
      where: { user_id: userId, status: "active" },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart tidak ditemukan" });
    }

    // cari item cart
    const item = await CartItem.findOne({
      where: {
        id: cart_item_id,
        cart_id: cart.id,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Item cart tidak ditemukan" });
    }

    item.qty = qty;
    await item.save();

    res.status(200).json({
      message: "Qty produk berhasil diupdate",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal update cart",
      error: error.message,
    });
  }
};

// export const deleteCartItem = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { cart_item_id } = req.params;

//     const cart = await Cart.findOne({
//       where: { user_id: userId, status: "active" },
//     });

//     if (!cart) {
//       return res.status(404).json({ message: "Cart tidak ditemukan" });
//     }

//     const item = await CartItem.findOne({
//       where: {
//         id: cart_item_id,
//         cart_id: cart.id,
//       },
//     });

//     if (!item) {
//       return res.status(404).json({ message: "Item cart tidak ditemukan" });
//     }

//     await item.destroy();

//     res.status(200).json({
//       message: "Produk berhasil dihapus dari cart",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Gagal hapus item cart",
//       error: error.message,
//     });
//   }
// };

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart_item_id } = req.params;

    const cart = await Cart.findOne({
      where: { user_id: userId, status: "active" },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart tidak ditemukan" });
    }

    const item = await CartItem.findOne({
      where: {
        id: cart_item_id,
        cart_id: cart.id,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Item cart tidak ditemukan" });
    }

    await item.destroy();

    // 🔥 CEK APAKAH CART MASIH PUNYA ITEM
    const remainingItems = await CartItem.count({
      where: { cart_id: cart.id },
    });

    // 🔥 JIKA KOSONG → HAPUS CART
    if (remainingItems === 0) {
      await cart.destroy();
      return res.status(200).json({
        message: "Produk dihapus, keranjang dikosongkan",
        cart_cleared: true,
      });
    }

    res.status(200).json({
      message: "Produk berhasil dihapus dari cart",
      cart_cleared: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal hapus item cart",
      error: error.message,
    });
  }
};
