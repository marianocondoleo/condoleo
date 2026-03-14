"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import CarritoIcon from "@/components/CarritoIcon";

type ItemCarrito = {
  id: string;
  name: string;
  pricePerKg: string;
  imagen: string;
  cantidad: number;
};

export default function CarritoPage() {
  const { user } = useUser();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("carrito");
    setItems(raw ? JSON.parse(raw) : []);
    setLoaded(true);
  }, []);

  const updateCarrito = (newItems: ItemCarrito[]) => {
    setItems(newItems);
    localStorage.setItem("carrito", JSON.stringify(newItems));
    window.dispatchEvent(new Event("carrito-actualizado"));
  };

  const handleCantidad = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      const nueva = Number((item.cantidad + delta).toFixed(1));
      return { ...item, cantidad: Math.max(0.5, nueva) };
    });
    updateCarrito(updated);
  };

  const handleEliminar = (id: string) => {
    updateCarrito(items.filter(item => item.id !== id));
  };

  const total = items.reduce((acc, item) => {
    return acc + Number(item.pricePerKg) * item.cantidad;
  }, 0);

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

      <div className="max-w-3xl mx-auto px-10 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
            Mi selección
          </p>
          <h1
            className="text-white text-5xl font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Carrito
          </h1>
          <div className="w-8 h-px bg-white/20 mt-4" />
        </div>

        {!loaded ? (
          <div className="text-white/20 text-sm tracking-widest uppercase">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <p className="text-white/20 text-lg font-light" style={{ fontFamily: "Georgia, serif" }}>
              Tu carrito está vacío
            </p>
            <Link
              href="/catalogo"
              className="border border-white/20 text-white/50 hover:text-white hover:border-white/50 px-8 py-3 rounded-full text-xs tracking-widest uppercase font-light transition-all duration-300"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Items */}
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-6 border border-white/10 rounded-lg p-5"
              >
                {/* Imagen */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  <img
                    src={item.imagen}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3
                    className="text-white text-lg font-light mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-white/30 text-xs tracking-widest uppercase">
                    ${Number(item.pricePerKg).toLocaleString("es-AR")} / kg
                  </p>
                </div>

                {/* Cantidad */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCantidad(item.id, -0.5)}
                    className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 text-white/50 hover:text-white transition-all flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white text-base font-light w-12 text-center">
                    {item.cantidad.toFixed(1)} kg
                  </span>
                  <button
                    onClick={() => handleCantidad(item.id, 0.5)}
                    className="w-8 h-8 rounded-full border border-white/20 hover:border-white/50 text-white/50 hover:text-white transition-all flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right w-28">
                  <p className="text-white text-lg font-light" style={{ fontFamily: "Georgia, serif" }}>
                    ${(Number(item.pricePerKg) * item.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => handleEliminar(item.id)}
                  className="text-white/20 hover:text-white/60 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Total y checkout */}
            <div className="border-t border-white/10 pt-8 mt-4 flex items-center justify-between">
              <div>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-1">Total</p>
                <p className="text-white text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
                  ${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <Link
                href="/checkout"
                className="bg-white text-black px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300 rounded-full"
              >
                Ir al checkout →
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}