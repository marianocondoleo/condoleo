"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CarritoIcon() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    const carritoRaw = localStorage.getItem("carrito");
    const carrito = carritoRaw ? JSON.parse(carritoRaw) : [];
    setCount(carrito.length);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("carrito-actualizado", updateCount);
    return () => window.removeEventListener("carrito-actualizado", updateCount);
  }, []);

  return (
    <Link
      href="/carrito"
      className="relative flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-widest uppercase font-light transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[10px] font-medium rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}