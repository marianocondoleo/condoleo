"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const checkUserRole = async () => {
      try {
        const res = await fetch("/api/perfil");
        const data = await res.json();
        if (data.user?.role === "admin") {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };
    checkUserRole();
  }, [isLoaded, user, router]);

  const bgImage =
    "url('https://images.pexels.com/photos/5960467/pexels-photo-5960467.jpeg')";

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-px h-12 bg-white/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: bgImage,
          filter: user
            ? "brightness(0.5) saturate(0.8)"
            : "brightness(0.4) saturate(0.8)",
          backgroundSize: "55%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />

      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar />

        {/* HERO */}
        {user ? (
          <div className="flex flex-col justify-end flex-1 px-16 pb-24">
            <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-6">
              Envios a todo el país.
            </p>

            <h1 className="text-white text-7xl font-light leading-tight mb-4">
              Bienvenido,<br />
              <span className="text-[#6294A0]">{user.firstName}.</span>
            </h1>

            <div className="w-10 h-px bg-white/20 my-6" />

            <p className="text-zinc-400 text-base mb-10 leading-relaxed">
              Plantillas ortopédicas a medida.<br />
              Diseñadas según indicaciónes médicas.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/solicitar"
                className="inline-flex items-center gap-4 border border-white/20 text-white/50 hover:text-white hover:border-white/60 px-8 py-4 text-xs tracking-widest uppercase rounded-full"
              >
                Solicitar ahora →
              </Link>

              <Link
                href="/mis-solicitudes"
                className="inline-flex items-center gap-4 border border-white/20 text-white/50 hover:text-white hover:border-white/60 px-8 py-4 text-xs tracking-widest uppercase rounded-full"
              >
                Mis solicitudes
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-10">
            <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-10">
              Empresa Argentina
            </p>

          <h1
            className="text-white text-8xl font-light leading-none mb-6"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Condoleo.
          </h1>

            <div className="w-12 h-px bg-white/20 my-8" />

            <p className="text-zinc-400 text-base mb-14 max-w-sm leading-relaxed">
               Plantillas ortopédicas a medida.<br />
              Diseñadas según indicaciónes médicas.
            </p>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-4 bg-[#6294A0] text-black px-10 py-4 text-xs tracking-widest uppercase font-medium rounded-full"
            >
              Comenzar →
            </Link>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-center pb-10">
          <p className="text-zinc-500 text-xs tracking-widest uppercase">
            Precisión · Salud · Confianza
          </p>
        </div>
      </div>
    </div>
  );
}