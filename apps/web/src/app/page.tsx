"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user, isLoaded } = useUser();

  const bgImage = "url('https://images.pexels.com/photos/29095933/pexels-photo-29095933.jpeg?auto=compress&cs=tinysrgb&w=1800')";

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-px h-12 bg-white/20 animate-pulse" />
      </div>
    );
  }

return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: bgImage,
          filter: user ? "brightness(0.5) saturate(0.9)" : "brightness(0.4) saturate(0.9)",
          backgroundSize: "50%",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-10 py-8">
          <span
            className="text-white tracking-[0.3em] uppercase text-sm font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Corte & Co.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/catalogo"
              className="text-white/50 hover:text-white text-xs tracking-widest uppercase font-light transition-colors"
            >
              Catálogo
            </Link>
           {user ? (
  <div className="flex items-center gap-4">
    <Link
      href="/perfil"
      className="text-white/50 hover:text-white text-xs tracking-widest uppercase font-light transition-colors"
    >
      Mi perfil
    </Link>
    <UserButton />
  </div>
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

        {user ? (
          /* Hero logueado — alineado a la izquierda */
          <div className="flex flex-col justify-end flex-1 px-16 pb-24">
            <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-6 font-light">
              Buenos Aires
            </p>
            <h1
              className="text-white text-7xl font-light leading-tight mb-4"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Bienvenido,<br />
              <span className="text-white/50">{user.firstName}.</span>
            </h1>
            <div className="w-10 h-px bg-white/20 my-6" />
            <p className="text-zinc-500 text-base font-light mb-10 leading-relaxed">
              Carne premium, envasada al vacío.<br />
              Directo a tu puerta.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-4 bg-white text-black px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300 rounded-full"
              >
                Ver catálogo
                <span>→</span>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-4 border border-white/20 text-white/50 hover:text-white hover:border-white/60 px-8 py-4 text-xs tracking-widest uppercase font-light transition-all duration-300 rounded-full"
              >
                Mis pedidos
              </Link>
            </div>
          </div>
        ) : (
          /* Hero no logueado — centrado */
          <div className="flex flex-col items-center justify-center flex-1 text-center px-10">
            <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-10 font-light">
              Buenos Aires
            </p>
            <h1
              className="text-white text-8xl font-light leading-none mb-6"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Corte & Co.
            </h1>
            <div className="w-12 h-px bg-white/20 my-8" />
            <p className="text-zinc-500 text-base font-light mb-14 max-w-sm leading-relaxed">
              Carne premium, envasada al vacío. Puerta a puerta.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-4 bg-white text-black px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300 rounded-full"
            >
              Ver catálogo
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-center pb-10">          
          <p className="text-zinc-500 text-xs tracking-widest uppercase">            Calidad · Frescura · Confianza
          </p>
        </div>

      </div>
    </div>
  );
}