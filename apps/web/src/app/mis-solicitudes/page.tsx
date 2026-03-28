"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

type Solicitud = {
  id: string;
  status: string;
  talle: string;
  medicoNombre?: string;
  notas?: string;
  precioProducto?: string;
  precioEnvio?: string | number | null;
  precioTotal?: string;
  envioModalidad?: string;
  envioTracking?: string;
  product?: { name: string; price: string };
  files?: { url: string; type?: string }[];
  createdAt?: string;
};

export default function MisSolicitudesPage() {
  const { user } = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/mis-solicitudes`);
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusColors: Record<string, string> = {
    solicitud_enviada: "bg-blue-500 text-white-100",
    aprobada_pendiente_pago: "bg-yellow-400 text-white-100",
    en_produccion: "bg-purple-500 text-yellow",
    despachado: "bg-indigo-500 text-green-100",
    recibida: "bg-green-500 text-green-100",
    cancelada: "bg-red-500 text-red-100",
  };

  return (
    <div className="space-y-6 min-h-screen bg-gray-900 p-4">
      <Navbar />

      {loading && (
        <p className="text-white text-center mt-10 text-lg">
          Cargando solicitudes...
        </p>
      )}

      {!loading && solicitudes.length === 0 && (
        <p className="text-white text-center mt-10 text-lg">
          No hay solicitudes para mostrar.
        </p>
      )}

      {!loading &&
        solicitudes.length > 0 &&
        solicitudes.map((s) => (
          <div
            key={s.id}
            className="bg-white/5 border border-white/10 rounded-2xl shadow-md p-4 transition-transform hover:scale-[1.01]"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(s.id)}
            >
              <div>
                <p className="font-semibold text-lg text-white">
                  {s.product?.name || "Producto"}
                </p>
                <p className="text-white/50 text-sm">
                  Creada:{" "}
                  {s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs uppercase ${
                    statusColors[s.status] || "bg-gray-400 text-black"
                  }`}
                >
                  {s.status.replace(/_/g, " ")}
                </span>
                <span className="text-white/40">
                  {expandedId === s.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedId === s.id && (
              <div className="mt-4 text-sm text-white/60 space-y-2 border-t border-white/10 pt-3">
                <p>
                  <strong>Talle:</strong> {s.talle}
                </p>
                <p>
                  <strong>Pie:</strong> {s.pie}
                </p>
                {s.medicoNombre && (
                  <p>
                    <strong>Médico:</strong> {s.medicoNombre}
                  </p>
                )}
                {s.notas && (
                  <p>
                    <strong>Notas:</strong> {s.notas}
                  </p>
                )}
                {s.precioProducto && (
                  <p>
                    <strong>Precio Producto:</strong> ${s.precioProducto}
                  </p>
                )}
                {s.precioEnvio != null && Number(s.precioEnvio) > 0 && ( // <--- Cambio clave
                  <p>
                    <strong>Precio Envío:</strong> ${s.precioEnvio}
                  </p>
                )}
                {s.precioTotal && (
                  <p>
                    <strong>Total:</strong> ${s.precioTotal}
                  </p>
                )}
                {s.envioModalidad && (
                  <p>
                    <strong>Modalidad envío:</strong> {s.envioModalidad}
                  </p>
                )}
                {s.envioTracking && (
                  <p>
                    <strong>Tracking:</strong> {s.envioTracking}
                  </p>
                )}

                {s.files?.length > 0 && (
                  <div>
                    <strong>Archivos:</strong>
                    {s.files.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        className="block text-[#6294A0] underline text-sm"
                      >
                        {f.type ? `${f.type} ${i + 1}` : `Archivo ${i + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}