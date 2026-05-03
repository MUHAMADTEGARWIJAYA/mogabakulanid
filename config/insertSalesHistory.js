import SalesHistory from "../models/SalesHistory.js";

export const insertSalesHistoryIfNotExists = async (order, transaction) => {
  const exist = await SalesHistory.findOne({
    where: { order_id: order.id },
    transaction,
  });

  if (exist) return;

  await SalesHistory.create(
    {
      order_id: order.id,
      umkm_id: order.umkm_id,
      user_id: order.user_id,
      total_harga: order.total_harga,
      ongkir: order.ongkir,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
    },
    { transaction }
  );
};
