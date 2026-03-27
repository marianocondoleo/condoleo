"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const links = [
    { href: "/admin/", label: "Dashboard", emoji: "👨‍💻" },
    { href: "/admin/solicitudes", label: "Solicitudes", emoji: "📋" },
    { href: "/admin/productos", label: "Productos", emoji: "📦" },
    { href: "/admin/metodos", label: "Métodos de Pago", emoji: "💳" },
    { href: "/admin/configuracion", label: "Configuración", emoji: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Barra superior */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div
          className="text-white text-2xl font-light tracking-[0.3em] uppercase"
          style={{ fontFamily: "Georgia, serif" }}
        >
          CONDOLEO
        </div>

        <UserButton />
      </header>

      {/* Cuerpo */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-white/5 p-6 border-r border-white/10 flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm uppercase font-light transition-colors hover:bg-white/10"
              >
                <span>{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}