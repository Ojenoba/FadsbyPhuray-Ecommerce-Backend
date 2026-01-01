// backend/routes/categories.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const categories = [
    "Jackets",
    "Tops",
    "Bottoms",
    "Shoes",
    "Dresses",
    "Bags",
    "Jewellery",
  ];
  res.json({ success: true, data: categories });
});

export default router;