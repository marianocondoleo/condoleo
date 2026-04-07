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
  adminNotes?: string;
  mensajeCliente?: string;
  precioProducto?: string;
  precioEnvio?: string;
  precioTotal?: string;
  product?: { name: string; price: string };
  files?: { url: string }[];
};

type ModalAccion = {
  solicitudId: string;
  tipo: "solicitar_pago" | "cancelar" | "en_produccion" | "despachado" | "recibida";
};

const STATUS_LABELS: Record<string, string> = {
  solicitud_enviada: "Enviada",
  aprobada_pendiente_pago: "Aprobada, Pendiente de Pago",
  en_produccion: "En Producción",
  despachado: "Despachado",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

const ACCION_CONFIG: Record<ModalAccion["tipo"], {
  label: string;
  status: string;
  requiereMensaje: boolean;
  mensajePlaceholder: string;
  confirmLabel: string;
  confirmClass: string;
}> = {
  solicitar_pago: {
    label: "Solicitar Pago",
    status: "aprobada_pendiente_pago",
    requiereMensaje: false,
    mensajePlaceholder: "Mensaje adicional para el paciente (opcional)...",
    confirmLabel: "Enviar instrucciones de pago",
    confirmClass: "bg-white text-black hover:bg-white/90",
  },
  cancelar: {
    label: "Cancelar solicitud",
    status: "cancelada",
    requiereMensaje: false,
    mensajePlaceholder: "Explicá al paciente el motivo de la cancelación...",
    confirmLabel: "Cancelar solicitud",
    confirmClass: "bg-red-500/80 hover:bg-red-500 text-white",
  },
  en_produccion: {
    label: "En Producción",
    status: "en_produccion",
    requiereMensaje: false,
    mensajePlaceholder: "Mensaje opcional para el paciente...",
    confirmLabel: "Confirmar",
    confirmClass: "bg-white text-black hover:bg-white/90",
  },
  despachado: {
    label: "Despachado",
    status: "despachado",
    requiereMensaje: false,
    mensajePlaceholder: "Podés incluir el número de tracking u otros datos...",
    confirmLabel: "Confirmar despacho",
    confirmClass: "bg-white text-black hover:bg-white/90",
  },
  recibida: {
    label: "Recibida",
    status: "recibida",
    requiereMensaje: false,
    mensajePlaceholder: "Mensaje opcional para el paciente...",
    confirmLabel: "Confirmar recepción",
    confirmClass: "bg-white text-black hover:bg-white/90",
  },
};

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalAccion | null>(null);
  const [mensajeCliente, setMensajeCliente] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [precioEnvio, setPrecioEnvio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch("/api/admin/solicitudes");
      const data = await res.json();
      setSolicitudes(Array.isArray(data?.data) ? data.data : []);
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

  const abrirModal = (solicitudId: string, tipo: ModalAccion["tipo"]) => {
    setMensajeCliente("");
    setAdminNotes("");
    setPrecioEnvio("");
    setError(null);
    setModal({ solicitudId, tipo });
  };

  const cerrarModal = () => {
    setModal(null);
    setMensajeCliente("");
    setAdminNotes("");
    setPrecioEnvio("");
    setError(null);
  };

  const confirmarAccion = async () => {
    if (!modal) return;
    setSaving(true);
    setError(null);

    const config = ACCION_CONFIG[modal.tipo];

    try {
      const res = await fetch(`/api/admin/solicitudes/${modal.solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: config.status,
          mensajeCliente: mensajeCliente || undefined,
          adminNotes: adminNotes || undefined,
          ...(modal.tipo === "solicitar_pago" && {
            precioEnvio: parseFloat(precioEnvio) || 0,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
        return;
      }

      cerrarModal();
      fetchSolicitudes();
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const grouped = solicitudes.reduce<Record<string, Solicitud[]>>((acc, s) => {
    const key = s.status || "sin_estado";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const statusOrder = [
    "solicitud_enviada",
    "aprobada_pendiente_pago",
    "en_produccion",
    "despachado",
    "recibida",
    "cancelada",
  ];

  const sortedGroups = statusOrder.filter((s) => grouped[s]);

  const getBotones = (status: string): ModalAccion["tipo"][] => {
    switch (status) {
      case "solicitud_enviada":
        return ["solicitar_pago", "cancelar"];
      case "aprobada_pendiente_pago":
        return ["en_produccion", "cancelar"];
      case "en_produccion":
        return ["despachado"];
      case "despachado":
        return ["recibida"];
      default:
        return [];
    }
  };

  const modalConfig = modal ? ACCION_CONFIG[modal.tipo] : null;
  const solicitudModal = modal ? solicitudes.find((s) => s.id === modal.solicitudId) : null;
  const totalCalculado =
    modal?.tipo === "solicitar_pago" && precioEnvio
      ? (
          parseFloat(solicitudModal?.precioProducto || "0") +
          parseFloat(precioEnvio || "0")
        ).toFixed(2)
      : null;

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
          Solicitudes.
        </h1>
      </div>

      {sortedGroups.length === 0 && (
        <p className="text-white/50">No hay solicitudes para mostrar.</p>
      )}

      {sortedGroups.map((status) => (
        <div key={status}>
          <h2 className="text-lg font-light mb-4 text-white/60 uppercase tracking-widest text-xs">
            {STATUS_LABELS[status] || status}
            <span className="ml-2 text-white/30">({grouped[status].length})</span>
          </h2>

          <div className="space-y-4">
            {grouped[status].map((s) => (
              <div key={s.id} className="border border-white/10 rounded-2xl p-4 bg-white/5">
                {/* Header */}
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExpand(s.id)}
                >
                  <div>
                    <p className="text-lg font-medium">
                      {`${s.user?.name || ""} ${s.user?.last_name || ""}`.trim() || "Usuario"}
                    </p>
                    {s.product && (
                      <p className="text-white/40 text-xs mt-0.5">{s.product.name}</p>
                    )}
                  </div>
                  <span className="text-xs uppercase text-white/30 mt-1">
                    {expandedId === s.id ? "▲" : "▼"}
                  </span>
                </div>

                {/* Detalles expandibles */}
                {expandedId === s.id && (
                  <div className="mt-4 text-sm text-white/60 space-y-4">

                    {/* Paciente */}
                    <div className="border-t border-white/10 pt-4">
                      <p className="font-medium mb-2 text-white/80 text-xs uppercase tracking-widest">Paciente</p>
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
                    <div className="border-t border-white/10 pt-4">
                      <p className="font-medium mb-2 text-white/80 text-xs uppercase tracking-widest">Solicitud</p>
                      <p>Medida: {s.talle} {s.tipoMedida}</p>
                      {s.product && <p>Producto: {s.product.name}</p>}
                      {s.precioProducto && <p>Precio producto: ${s.precioProducto}</p>}
                      {s.precioEnvio && Number(s.precioEnvio) > 0 && (
                        <p>Precio envío: ${s.precioEnvio}</p>
                      )}
                      {s.precioTotal && <p>Total: ${s.precioTotal}</p>}
                      {s.medicoNombre && <p>Médico: {s.medicoNombre}</p>}
                      {s.notas && <p>Notas del paciente: {s.notas}</p>}
                      {s.files && s.files.length > 0 && (
                        <div className="mt-2">
                          <p className="mb-1">Archivos:</p>
                          {s.files.map((f, i) => (
                            <a
                              key={i}
                              href={f.url}
                              target="_blank"
                              className="block underline text-sm text-white/50 hover:text-white"
                            >
                              Ver archivo {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notas internas */}
                    {s.adminNotes && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="font-medium mb-2 text-white/80 text-xs uppercase tracking-widest">🔒 Notas internas</p>
                        <p className="text-white/50 text-sm">{s.adminNotes}</p>
                      </div>
                    )}

                    {/* Mensaje al cliente */}
                    {s.mensajeCliente && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="font-medium mb-2 text-white/80 text-xs uppercase tracking-widest">💬 Mensaje enviado al paciente</p>
                        <p className="text-white/50 text-sm">{s.mensajeCliente}</p>
                      </div>
                    )}

                    {/* Botones */}
                    {getBotones(s.status).length > 0 && (
                      <div className="border-t border-white/10 pt-4 flex gap-2 flex-wrap">
                        {getBotones(s.status).map((tipo) => (
                          <button
                            key={tipo}
                            onClick={() => abrirModal(s.id, tipo)}
                            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors border ${
                              tipo === "cancelar"
                                ? "border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/60"
                                : "border-white/20 text-white/50 hover:text-white hover:border-white/40"
                            }`}
                          >
                            {ACCION_CONFIG[tipo].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {modal && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-light mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {modalConfig.label}
            </h2>

            <div className="space-y-4">

              {/* Campo envío — solo para solicitar pago */}
              {modal.tipo === "solicitar_pago" && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                    Costo de envío ($)
                  </label>
                  <input
                    type="number"
                    value={precioEnvio}
                    onChange={(e) => setPrecioEnvio(e.target.value)}
                    placeholder="Ej: 3500"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20"
                  />
                  {totalCalculado && (
                    <div className="mt-3 flex justify-between items-center px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-xs uppercase tracking-widest text-white/40">Total a cobrar</span>
                      <span className="text-white font-medium">${totalCalculado}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje al paciente */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                  Mensaje al paciente (opcional)
                </label>
                <textarea
                  value={mensajeCliente}
                  onChange={(e) => setMensajeCliente(e.target.value)}
                  rows={3}
                  placeholder={modalConfig.mensajePlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none placeholder:text-white/20"
                />
              </div>

              {/* Notas internas */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                  🔒 Notas internas (solo admin)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas internas para el equipo..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none placeholder:text-white/20"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 mt-8">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={saving}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${modalConfig.confirmClass}`}
              >
                {saving ? "Guardando…" : modalConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}