import db from "../config/database.js";
import User from "./User.js";
import Umkm from "./Umkm.js";
import Admin from "./Admin.js";
import Product from "./Product.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import SalesHistory from "./SalesHistory.js";
import Message from "./Message.js";
import Chat from "./Chat.js";

// Buyer (User)
Chat.belongsTo(User, {
  foreignKey: "buyer_id",
  as: "buyer",
});

// Seller (UMKM)
Chat.belongsTo(Umkm, {
  foreignKey: "seller_id",
  as: "seller",
});

// Chat - Message
Chat.hasMany(Message, { foreignKey: "chat_id" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });
// ORDER ↔ UMKM
Umkm.hasMany(Order, {
  foreignKey: "umkm_id",
  as: "orders",
});

Order.belongsTo(Umkm, {
  foreignKey: "umkm_id",
  as: "umkm",
});

// ORDER ↔ USER
// User.hasMany(Order, {
//   foreignKey: "user_id",
// });

// Order.belongsTo(User, {
//   foreignKey: "user_id",
// });
// ORDER ↔ USER
// User.hasMany(Order, { foreignKey: "user_id" });
// Order.belongsTo(User, { foreignKey: "user_id" });

// ORDER ↔ USER (FIX & PAKAI ALIAS)
User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// PRODUCT ↔ ORDER ITEM (WAJIB)
Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "order_items",
});

OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ================= RELATION =================
Umkm.hasMany(Product, { foreignKey: "umkm_id" });
Product.belongsTo(Umkm, { foreignKey: "umkm_id" });

// CART ↔ CART ITEM
Cart.hasMany(CartItem, { foreignKey: "cart_id" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

// PRODUCT ↔ CART ITEM
// Product.hasMany(CartItem, { foreignKey: "product_id" });
// CartItem.belongsTo(Product, { foreignKey: "product_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(CartItem, {
  foreignKey: "product_id",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

export { db, User, Umkm, Admin, SalesHistory, Product, Cart, CartItem };
