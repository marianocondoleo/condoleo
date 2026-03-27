"use client";

import { useEffect, useState } from "react";

type Solicitud = {
  id: string;
  user?: {
    name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    addresses?: {
      id: string;
      street?: string;
      number?: string;
      floor?: string;
      city?: string;
      postal_code?: string;
    }[];
  };
  talle: string;
  tipoMedida: string;
  status: string;
  medicoNombre?: string;
  notas?: string;
  precio?: string;
  product?: { name: string; price: string };
  files?: { url: string }[];
};

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    enviada: "Enviada",
    aprobada_pendiente_pago: "Aprobada, Pendiente de Pago",
    en_produccion: "En Producción",
    despachado: "Despachado",
    recibida: "Recibida",
    cancelada: "Cancelada",
  };

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch("/api/admin/solicitudes");
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setSolicitudes([]);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const grouped = solicitudes.reduce<Record<string, Solicitud[]>>((acc, s) => {
    const key = s.status || "sin_estado";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-8 space-y-8">
            <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
          Solicitudes.
        </h1>
      </div>
      {Object.keys(grouped).length === 0 && (
        <p className="text-white/50">No hay solicitudes para mostrar.</p>
      )}

      {Object.keys(grouped).map((status) => (
        <div key={status}>
          <h2 className="text-2xl font-semibold mb-4">
            {statusLabels[status] || status}
          </h2>

          <div className="space-y-4">
            {grouped[status].map((s) => (
              <div
                key={s.id}
                className="border border-white/10 rounded-2xl p-4 bg-white/5"
              >
                {/* Header con name + last_name y status */}
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExpand(s.id)}
                >
                  <p className="text-lg font-bold">
                    {`${s.user?.name || ""} ${s.user?.last_name || ""}`.trim() || "Usuario"}
                  </p>
                  <span className="text-xs uppercase text-white/40">
                    {statusLabels[s.status] || s.status}
                  </span>
                </div>

                {/* Detalles expandibles */}
                {expandedId === s.id && (
                  <div className="mt-2 text-sm text-white/60">
                    {/* Datos del usuario */}
                    <div className="border-t border-white/20 pt-2 mb-4">
                      <p className="font-semibold mb-2 text-white/80 text-sm uppercase">Datos</p>
                      {s.user?.phone && <p>📞 {s.user.phone}</p>}
                      {s.user?.email && <p>✉️ {s.user.email}</p>}
                      {s.user?.addresses?.map((addr) => (
                        <p key={addr.id}>
                          🏠 {addr.street || ""} {addr.number || ""}
                          {addr.floor ? `, Piso: ${addr.floor}` : ""}
                          {addr.city ? `, ${addr.city}` : ""}
                          {addr.postal_code ? `, CP: ${addr.postal_code}` : ""}
                        </p>
                      ))}
                    </div>

                    {/* Solicitud */}
                    <div className="border-t border-white/20 pt-2">
                      <p className="font-semibold mb-2 text-white/80 text-sm uppercase">Solicitud</p>
                      <p>Medida: {s.talle} {s.tipoMedida}</p>
                      {s.product && <p>Producto: {s.product.name}</p>}
                      {s.files?.length > 0 && (
                        <div className="mt-1">
                          Archivos:
                          {s.files.map((f, i) => (
                            <a
                              key={i}
                              href={f.url}
                              target="_blank"
                              className="block underline text-sm text-white/60"
                            >
                              Ver archivo {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {s.medicoNombre && <p>Médico: {s.medicoNombre}</p>}
                      {s.notas && <p>Notas: {s.notas}</p>}
                      {s.precio && <p>Precio: ${s.precio}</p>}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 flex-wrap mt-4">
                      <button className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase">
                        Solicitar Pago
                      </button>
                      <button className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase">
                        En Producción
                      </button>
                      <button className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase">
                        Despachado
                      </button>
                      <button className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase">
                        Recibida
                      </button>
                      <button className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}