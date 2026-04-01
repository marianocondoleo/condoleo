"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Conteos = {
  solicitud_enviada: number;
  aprobada_pendiente_pago: number;
  en_produccion: number;
  despachado: number;
  recibida: number;
  cancelada: number;
};

export default function AdminDashboard() {
  const [conteos, setConteos] = useState<Conteos | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setConteos);
  }, []);

  const total = conteos
    ? Object.values(conteos).reduce((a, b) => a + b, 0)
    : null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light" style={{ fontFamily: "Georgia, serif" }}>
            Dashboard.
          </h1>
          <div className="w-10 h-px bg-white/20 mt-6" />
        </div>

        {/* Stats de solicitudes */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-6">
            Solicitudes
            {total !== null && (
              <span className="ml-2 text-white/20">— {total} en total</span>
            )}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Nuevas"
              value={conteos?.solicitud_enviada}
              href="/admin/solicitudes"
              highlight
            />
            <StatCard
              label="Pendientes de pago"
              value={conteos?.aprobada_pendiente_pago}
              href="/admin/solicitudes"
            />
            <StatCard
              label="En producción"
              value={conteos?.en_produccion}
              href="/admin/solicitudes"
            />
            <StatCard
              label="Despachadas"
              value={conteos?.despachado}
              href="/admin/solicitudes"
            />
            <StatCard
              label="Recibidas"
              value={conteos?.recibida}
              href="/admin/solicitudes"
            />
            <StatCard
              label="Canceladas"
              value={conteos?.cancelada}
              href="/admin/solicitudes"
              muted
            />
          </div>
        </div>

        {/* Links rápidos */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-6">Gestión</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/solicitudes"
            className="border border-white/10 p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition group"
          >
            <h2 className="text-xl font-light mb-2 group-hover:text-white transition">
              Solicitudes
            </h2>
            <p className="text-white/40 text-sm">
              Revisar, aprobar y gestionar pedidos
            </p>
          </Link>

          <Link
            href="/admin/productos"
            className="border border-white/10 p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition group"
          >
            <h2 className="text-xl font-light mb-2 group-hover:text-white transition">
              Productos
            </h2>
            <p className="text-white/40 text-sm">
              Gestionar el catálogo de plantillas
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight = false,
  muted = false,
}: {
  label: string;
  value?: number;
  href: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border rounded-2xl p-6 transition hover:bg-white/10 ${
        highlight
          ? "border-white/30 bg-white/10"
          : muted
          ? "border-white/5 bg-white/[0.02] opacity-60"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-3xl font-light mb-2">
        {value === undefined ? (
          <span className="text-white/20">—</span>
        ) : (
          value
        )}
      </p>
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
    </Link>
  );
}