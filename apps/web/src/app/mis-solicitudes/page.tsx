"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { ensureProxyUrl } from "@/lib/cloudinary-client";

type Solicitud = {
  id: string;
  status: string;
  talle: string;
  tipoMedida?: string;
  medicoNombre?: string;
  notas?: string;
  mensajeCliente?: string;
  precioProducto?: string;
  precioEnvio?: string | number | null;
  precioTotal?: string;
  envioModalidad?: string;
  envioTracking?: string;
  product?: { name: string; price: string };
  files?: { url: string; type?: string }[];
  createdAt?: string;
};

const STATUS_LABELS: Record<string, string> = {
  solicitud_enviada: "Enviada",
  aprobada_pendiente_pago: "Pendiente de pago",
  en_produccion: "En producción",
  despachado: "Despachado",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

const STATUS_INFO: Record<string, { color: string; leyenda?: string }> = {
  solicitud_enviada: {
    color: "text-blue-400 border-blue-400/30",
    leyenda: "Recibimos tu solicitud. Nuestro equipo la está revisando y pronto te informaremos el costo de envío y el total a abonar.",
  },
  aprobada_pendiente_pago: {
    color: "text-yellow-400 border-yellow-400/30",
    leyenda: "Tu solicitud fue aprobada. Revisá tu email con las instrucciones de pago.",
  },
  en_produccion: {
    color: "text-purple-400 border-purple-400/30",
    leyenda: "Tu plantilla está siendo fabricada.",
  },
  despachado: {
    color: "text-indigo-400 border-indigo-400/30",
    leyenda: "Tu pedido fue despachado. Pronto lo recibirás.",
  },
  recibida: {
    color: "text-green-400 border-green-400/30",
  },
  cancelada: {
    color: "text-red-400 border-red-400/30",
  },
};

export default function MisSolicitudesPage() {
  const { user } = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/mis-solicitudes");
        const data = await res.json();
        setSolicitudes(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Título */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.6em] uppercase text-xs mb-4">
            Mi cuenta
          </p>
          <h1
            className="text-4xl font-light"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Mis solicitudes.
          </h1>
          <div className="w-10 h-px bg-white/20 mt-6" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-px h-12 bg-white/20 animate-pulse" />
          </div>
        )}

        {/* Sin solicitudes */}
        {!loading && solicitudes.length === 0 && (
          <p className="text-white/40 text-sm">No tenés solicitudes aún.</p>
        )}

        {/* Lista */}
        {!loading && solicitudes.length > 0 && (
          <div className="space-y-4">
            {solicitudes.map((s) => {
              const statusInfo = STATUS_INFO[s.status] || { color: "text-white/40 border-white/10" };
              return (
                <div
                  key={s.id}
                  className="border border-white/10 rounded-2xl bg-white/5"
                >
                  {/* Header */}
                  <div
                    className="flex justify-between items-center p-5 cursor-pointer"
                    onClick={() => toggleExpand(s.id)}
                  >
                    <div>
                      <p className="font-medium text-white">
                        {s.product?.name || "Producto"}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs uppercase tracking-wider border px-3 py-1 rounded-full ${statusInfo.color}`}>
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                      <span className="text-white/30 text-xs">
                        {expandedId === s.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Leyenda de estado — siempre visible debajo del header */}
                  {statusInfo.leyenda && (
                    <div className="px-5 pb-4 -mt-2">
                      <p className="text-white/40 text-xs leading-relaxed border-l-2 border-white/10 pl-3">
                        {statusInfo.leyenda}
                      </p>
                    </div>
                  )}

                  {/* Mensaje del equipo */}
                  {s.mensajeCliente && (
                    <div className="px-5 pb-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <p className="text-xs uppercase tracking-widest text-white/30 mb-1">
                          Mensaje del equipo
                        </p>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {s.mensajeCliente}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Detalles expandibles */}
                  {expandedId === s.id && (
                    <div className="px-5 pb-5 text-sm text-white/50 space-y-2 border-t border-white/10 pt-4">
                      <p><span className="text-white/30">Medida:</span> {s.talle} {s.tipoMedida}</p>
                      {s.medicoNombre && (
                        <p><span className="text-white/30">Médico:</span> {s.medicoNombre}</p>
                      )}
                      {s.notas && (
                        <p><span className="text-white/30">Notas:</span> {s.notas}</p>
                      )}
                      {s.precioProducto && (
                        <p><span className="text-white/30">Producto:</span> ${s.precioProducto}</p>
                      )}
                      {s.precioEnvio != null && Number(s.precioEnvio) > 0 && (
                        <p><span className="text-white/30">Envío:</span> ${s.precioEnvio}</p>
                      )}
                      {s.precioTotal && (
                        <p><span className="text-white/30">Total:</span> ${s.precioTotal}</p>
                      )}
                      {s.envioModalidad && (
                        <p><span className="text-white/30">Modalidad:</span> {s.envioModalidad}</p>
                      )}
                      {s.envioTracking && (
                        <p><span className="text-white/30">Tracking:</span> {s.envioTracking}</p>
                      )}
                      {s.files && s.files.length > 0 && (
                        <div>
                          <p className="text-white/30 mb-1">Archivos:</p>
                          {s.files.map((f, i) => (
                            <a
                              key={i}
                              href={ensureProxyUrl(f.url, true)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[#6294A0] underline text-xs hover:text-white transition-colors"
                            >
                              {f.type || `Archivo ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}