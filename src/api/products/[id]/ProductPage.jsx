// src/app/products/[id]/page.jsx

export default async function ProductPage({ params }) {
  const { id } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const { product } = await res.json();

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        <div>
          <img src={product.image_url || "/placeholder.jpg"} alt={product.name} className="w-full rounded-2xl shadow-2xl" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-[#8B4513] mb-6">{product.name}</h1>
          <p className="text-xl text-gray-700 mb-8">{product.description}</p>
          <p className="text-5xl font-bold text-[#FF6B35] mb-10">₦{product.price}</p>
          <button className="bg-[#FF6B35] text-white py-6 rounded-2xl text-2xl font-bold hover:bg-[#E55A24] transition">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}