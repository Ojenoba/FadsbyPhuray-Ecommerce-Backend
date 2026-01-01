import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true }, // ✅ new slug field
    description: { type: String, required: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        "Jackets",
        "Tops",
        "Bottoms",
        "Shoes",
        "Dresses",
        "Bags",
        "Jewellery",
      ],
      required: true,
    },
    images: [{ type: String, required: true }], // multiple images
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // relational reviews
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Add index BEFORE compiling the model
productSchema.index({ name: "text", description: "text", category: 1 });

// ✅ Middleware to auto-generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;