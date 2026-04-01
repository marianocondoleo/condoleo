"use client";

import { useEffect, useState } from "react";

type PaymentMethod = {
  id: string;
  method: string;
  label: string;
  icon?: string | null;
  isActive?: boolean | null;
  bankName?: string | null;
  cbu?: string | null;
  alias?: string | null;
  titular?: string | null;
  whatsapp?: string | null;
};

const EMPTY_FORM = {
  method: "transferencia",
  label: "",
  icon: "",
  isActive: true,
  bankName: "",
  cbu: "",
  alias: "",
  titular: "",
  whatsapp: "",
};

export default function AdminMetodosPagoPage() {
  const [metodos, setMetodos] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMetodos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-config");
      const data = await res.json();
      setMetodos(Array.isArray(data) ? data : []);
    } catch {
      setMetodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetodos();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditing(null);
    setModal("create");
  };

  const openEdit = (m: PaymentMethod) => {
    setForm({
      method: m.method,
      label: m.label,
      icon: m.icon || "",
      isActive: m.isActive ?? true,
      bankName: m.bankName || "",
      cbu: m.cbu || "",
      alias: m.alias || "",
      titular: m.titular || "",
      whatsapp: m.whatsapp || "",
    });
    setFormError(null);
    setEditing(m);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.method || !form.label) {
      setFormError("Method y label son requeridos.");
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      const url =
        modal === "edit" && editing
          ? `/api/admin/payment-config/${editing.id}`
          : "/api/admin/payment-config";
      const method = modal === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error || "Error al guardar");
        return;
      }

      closeModal();
      fetchMetodos();
    } catch {
      setFormError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/payment-config/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Error al eliminar");
        return;
      }
      setDeleteId(null);
      fetchMetodos();
    } catch {
      setDeleteError("Error de red");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (m: PaymentMethod) => {
    await fetch(`/api/admin/payment-config/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...m, isActive: !m.isActive }),
    });
    fetchMetodos();
  };

  // Campos extra según el método seleccionado
  const isTransferencia = form.method === "transferencia";

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
          Métodos de pago.
        </h1>
        <button
          onClick={openCreate}
          className="px-5 py-2 border border-white/20 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {loading && <p className="text-white/40">Cargando…</p>}

      {!loading && (
        <div className="border border-white/10 rounded-2xl overflow-hidden">
          {metodos.length === 0 ? (
            <p className="p-8 text-white/40 text-sm">No hay métodos de pago configurados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase text-xs tracking-widest">
                  <th className="text-left px-6 py-4">Label</th>
                  <th className="text-left px-6 py-4">Método</th>
                  <th className="text-left px-6 py-4">CBU / Alias</th>
                  <th className="text-left px-6 py-4">Estado</th>
                  <th className="text-right px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {metodos.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      i === metodos.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">{m.label}</td>
                    <td className="px-6 py-4 text-white/50 font-mono">{m.method}</td>
                    <td className="px-6 py-4 text-white/50">
                      {m.cbu || m.alias ? (
                        <span>{m.alias || m.cbu}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(m)}
                        className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-colors ${
                          m.isActive
                            ? "bg-white/10 text-white"
                            : "bg-white/5 text-white/30"
                        }`}
                      >
                        {m.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setDeleteId(m.id); setDeleteError(null); }}
                          className="text-red-400/60 hover:text-red-400 transition-colors text-xs uppercase tracking-wider"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-light mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {modal === "create" ? "Nuevo método de pago" : "Editar método de pago"}
            </h2>

            <div className="space-y-4">
              <Field label="Label *">
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Ej: Transferencia Bancaria"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                />
              </Field>

              <Field label="Method *">
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>

              {/* Campos de transferencia */}
              {isTransferencia && (
                <>
                  <Field label="Banco">
                    <input
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      placeholder="Ej: Banco Galicia"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                    />
                  </Field>
                  <Field label="CBU">
                    <input
                      value={form.cbu}
                      onChange={(e) => setForm({ ...form, cbu: e.target.value })}
                      placeholder="0000000000000000000000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-white/30"
                    />
                  </Field>
                  <Field label="Alias">
                    <input
                      value={form.alias}
                      onChange={(e) => setForm({ ...form, alias: e.target.value })}
                      placeholder="condoleo.pago"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-white/30"
                    />
                  </Field>
                  <Field label="Titular">
                    <input
                      value={form.titular}
                      onChange={(e) => setForm({ ...form, titular: e.target.value })}
                      placeholder="Condoleo SRL"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                    />
                  </Field>
                </>
              )}

              <Field label="WhatsApp (opcional)">
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    form.isActive ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                      form.isActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-white/60">Activo</span>
              </label>
            </div>

            {formError && <p className="mt-4 text-red-400 text-sm">{formError}</p>}

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
            <p className="text-lg mb-2">¿Eliminar método de pago?</p>
            <p className="text-white/40 text-sm mb-4">Esta acción no se puede deshacer.</p>
            {deleteError && <p className="text-red-400 text-sm mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteError(null); }}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}