"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  images?: string[] | null;
  isActive?: boolean | null;
};

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const activos = Array.isArray(data)
          ? data.filter((p: Product) => p.isActive !== false)
          : [];
        setProducts(activos);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Título */}
        <div className="mb-16">
          <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-4">
            Catálogo
          </p>
          <h1
            className="text-5xl font-light"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Productos.
          </h1>
          <div className="w-10 h-px bg-white/20 mt-6" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-px h-12 bg-white/20 animate-pulse" />
          </div>
        )}

        {/* Sin productos */}
        {!loading && products.length === 0 && (
          <p className="text-white/40 text-sm">No hay productos disponibles.</p>
        )}

        {/* Grid de cards */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:bg-white/8 transition-colors group"
              >
                {/* Imagen */}
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/10 text-xs uppercase tracking-widest">
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 space-y-3">
                  <h2
                    className="text-lg font-light"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {p.name}
                  </h2>

                  {p.description && (
                    <p className="text-white/40 text-sm leading-relaxed line-clamp-3">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center pb-10">
        <p className="text-zinc-600 text-xs tracking-widest uppercase">
          Precisión · Salud · Confianza
        </p>
      </div>
    </div>
  );
}