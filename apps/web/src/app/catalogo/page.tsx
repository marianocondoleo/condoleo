"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string;
  pricePerKg: string;
  stockKg: string;
  origin: string;
  images: string[];
  category: string;
  categorySlug: string;
};

export default function CatalogoPage() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalogo")
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-8 border-b border-white/5">
        <Link
          href="/"
          className="text-white tracking-[0.3em] uppercase text-sm font-light"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Corte & Co.
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/perfil" className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors">
                Mi perfil
              </Link>
              <UserButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-white/70 hover:text-white border border-white/20 hover:border-white/60 px-5 py-2 rounded-full text-xs tracking-widest uppercase font-light transition-all duration-300"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-10 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
            Selección premium
          </p>
          <h1
            className="text-white text-5xl font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Catálogo
          </h1>
          <div className="w-8 h-px bg-white/20 mt-4" />
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="text-white/20 text-sm tracking-widest uppercase">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/producto/${product.id}`}
                className="group border border-white/10 hover:border-white/30 rounded-lg overflow-hidden transition-all duration-300"
              >
                {/* Imagen */}
                <div className="aspect-square bg-zinc-900 overflow-hidden">
                  <img
                    src={product.images?.[0] ?? ""}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-white/30 text-xs tracking-widest uppercase mb-2">
                    {product.category}
                  </p>
                  <h3
                    className="text-white text-lg font-light mb-3"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/40 text-xs mb-1">precio por kg</p>
                      <p className="text-white text-lg font-light">
                        ${Number(product.pricePerKg).toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                      <span className="text-white/50 group-hover:text-black text-sm">+</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}