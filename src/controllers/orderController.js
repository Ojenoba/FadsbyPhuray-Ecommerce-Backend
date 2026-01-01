import Order from "../models/Order.js";      // ✅ default import
import Product from "../models/Product.js";  // ✅ default import
import { asyncHandler } from "../middleware/errorHandler.js";

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
  const { customer, items, total, paymentMethod } = req.body;

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for ${item.name}`,
      });
    }
    product.stock -= item.quantity;
    await product.save();
  }

  const order = new Order({ customer, items, total, paymentMethod });
  await order.save();

  res.status(201).json({
    success: true,
    data: order,
  });
});

// Get all orders
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("items.productId", "name price");
  res.status(200).json({
    success: true,
    data: orders,
  });
});

// Get single order
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.productId", "name price");
  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    });
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// Mark order shipped
export const markOrderShipped = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "shipped" },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled" },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});