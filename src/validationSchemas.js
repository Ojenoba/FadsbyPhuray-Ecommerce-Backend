import Joi from "joi";

// Product validation
export const productSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(1000).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string()
    .valid("Jackets", "Tops", "Bottoms", "Shoes", "Dresses", "Bags", "Jewellery")
    .required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  stock: Joi.number().min(0).default(0),
}).unknown(true); // ✅ allows extra fields

// User registration
export const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).unknown(true); // ✅ allows extra fields

// User login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(true); // ✅ allows extra fields

// Order validation
export const orderSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }),
  }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
        name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  total: Joi.number().min(0).required(),
  paymentMethod: Joi.string()
    .valid("flutterwave", "credit_card", "bank_transfer")
    .required(),
}).unknown(true); // ✅ allows extra fields