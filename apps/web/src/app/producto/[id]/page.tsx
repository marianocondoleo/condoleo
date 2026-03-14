"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CarritoIcon from "@/components/CarritoIcon";

type Product = {
  id: string;
  name: string;
  sku: string;
  pricePerKg: string;
  stockKg: string;
  origin: string;
  breed: string | null;
  slaughterDate: string | null;
  images: string[];
  category: string;
  categorySlug: string;
};

export default function ProductoPage() {
  const { user } = useUser();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(0.5);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    fetch(`/api/producto/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const precioTotal = product
    ? Number(product.pricePerKg) * cantidad
    : 0;

 const handleAgregar = () => {
  if (!product) return;

  if (!user) {
    window.location.href = "/sign-in";
    return;
  }

  const carritoRaw = localStorage.getItem("carrito");
  const carrito = carritoRaw ? JSON.parse(carritoRaw) : [];

  const existente = carrito.findIndex((i: any) => i.id === product.id);

  if (existente >= 0) {
    carrito[existente].cantidad += cantidad;
  } else {
    carrito.push({
      id: product.id,
      name: product.name,
      pricePerKg: product.pricePerKg,
      imagen: product.images?.[0] ?? "",
      cantidad,
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  window.dispatchEvent(new Event("carrito-actualizado"));
  setAgregado(true);
  setTimeout(() => setAgregado(false), 2000);
};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-px h-12 bg-white/20 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white/30">
        Producto no encontrado
      </div>
    );
  }

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
          <Link
            href="/catalogo"
            className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors"
          >
            
            ← Catálogo
          </Link>
          <CarritoIcon />  
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

      <div className="max-w-5xl mx-auto px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Imagen */}
          <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden">
            <img
              src={product.images?.[0] ?? ""}
              alt={product.name}
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
              {product.category} · {product.sku}
            </p>
            <h1
              className="text-white text-5xl font-light mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {product.name}
            </h1>
            <div className="w-8 h-px bg-white/20 mb-8" />

            {/* Trazabilidad */}
            <div className="flex flex-col gap-3 mb-8">
              {product.origin && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/20 w-20 text-xs tracking-widest uppercase">Origen</span>
                  <span className="text-white/60">{product.origin}</span>
                </div>
              )}
              {product.breed && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/20 w-20 text-xs tracking-widest uppercase">Raza</span>
                  <span className="text-white/60">{product.breed}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/20 w-20 text-xs tracking-widest uppercase">Stock</span>
                <span className="text-white/60">{Number(product.stockKg).toFixed(0)} kg disponibles</span>
              </div>
            </div>

            {/* Precio */}
            <div className="mb-8">
              <p className="text-white/30 text-xs tracking-widest uppercase mb-1">precio por kg</p>
              <p className="text-white text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
                ${Number(product.pricePerKg).toLocaleString("es-AR")}
              </p>
            </div>

            {/* Selector de cantidad */}
            <div className="mb-8">
              <p className="text-white/30 text-xs tracking-widest uppercase mb-4">cantidad (kg)</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(prev => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 text-white/50 hover:text-white transition-all flex items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="text-white text-2xl font-light w-16 text-center" style={{ fontFamily: "Georgia, serif" }}>
                  {cantidad.toFixed(1)}
                </span>
                <button
                  onClick={() => setCantidad(prev => Number((prev + 0.5).toFixed(1)))}
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 text-white/50 hover:text-white transition-all flex items-center justify-center text-lg"
                >
                  +
                </button>
                <span className="text-white/30 text-sm ml-2">kg</span>
              </div>
            </div>

            {/* Total + botón */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-1">total</p>
                <p className="text-white text-2xl font-light" style={{ fontFamily: "Georgia, serif" }}>
                  ${precioTotal.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <button
                onClick={handleAgregar}
                className={`flex-1 py-4 text-xs tracking-widest uppercase font-medium rounded-full transition-all duration-300 ${
                  agregado
                    ? "bg-white/20 text-white/60"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {agregado ? "✓ Agregado" : "Agregar al carrito"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}