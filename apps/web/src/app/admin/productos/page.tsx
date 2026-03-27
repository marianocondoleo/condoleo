"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId?: string | null;
  price: string;
  description?: string | null;
  images?: string[] | null;
  isActive?: boolean | null;
  createdAt?: string | null;
};

const EMPTY_FORM = {
  name: "",
  sku: "",
  price: "",
  description: "",
  images: "",
  isActive: true,
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/productos");
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditing(null);
    setModal("create");
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      description: p.description || "",
      images: p.images?.join(", ") || "",
      isActive: p.isActive ?? true,
    });
    setFormError(null);
    setEditing(p);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: form.price.trim(),
      description: form.description.trim() || null,
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      isActive: form.isActive,
    };

    if (!payload.name || !payload.sku || !payload.price) {
      setFormError("Nombre, SKU y precio son requeridos.");
      setSaving(false);
      return;
    }

    try {
      const url =
        modal === "edit" && editing
          ? `/api/admin/productos/${editing.id}`
          : "/api/admin/productos";
      const method = modal === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error || "Error al guardar");
        return;
      }

      closeModal();
      fetchProductos();
    } catch {
      setFormError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);

const handleDelete = async () => {
  if (!deleteId) return;
  setDeleting(true);
  setDeleteError(null);
  try {
    const res = await fetch(`/api/admin/productos/${deleteId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.error);
      return;
    }
    setDeleteId(null);
    fetchProductos();
  } catch {
    setDeleteError("Error de red");
  } finally {
    setDeleting(false);
  }
};

  const toggleActive = async (p: Product) => {
    await fetch(`/api/admin/productos/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, isActive: !p.isActive }),
    });
    fetchProductos();
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "Georgia, serif" }}>
          Productos.
        </h1>
        <button
          onClick={openCreate}
          className="px-5 py-2 border border-white/20 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* Estados */}
      {loading && <p className="text-white/40">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* Tabla */}
      {!loading && !error && (
        <div className="border border-white/10 rounded-2xl overflow-hidden">
          {productos.length === 0 ? (
            <p className="p-8 text-white/40 text-sm">No hay productos aún.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase text-xs tracking-widest">
                  <th className="text-left px-6 py-4">Nombre</th>
                  <th className="text-left px-6 py-4">SKU</th>
                  <th className="text-left px-6 py-4">Precio</th>
                  <th className="text-left px-6 py-4">Estado</th>
                  <th className="text-right px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      i === productos.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-white/50 font-mono">{p.sku}</td>
                    <td className="px-6 py-4">${p.price}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-colors ${
                          p.isActive
                            ? "bg-white/10 text-white"
                            : "bg-white/5 text-white/30"
                        }`}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
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
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-light mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {modal === "create" ? "Nuevo producto" : "Editar producto"}
            </h2>

            <div className="space-y-4">
              <Field label="Nombre *">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="Plantilla ortopédica premium"
                />
              </Field>

              <Field label="SKU *">
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-white/30"
                  placeholder="PLT-001"
                />
              </Field>

              <Field label="Precio *">
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  type="number"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="12500"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Descripción del producto…"
                />
              </Field>

              <Field label="Imágenes (URLs separadas por coma)">
                <input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="https://…, https://…"
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

            {formError && (
              <p className="mt-4 text-red-400 text-sm">{formError}</p>
            )}

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
            <p className="text-lg mb-2">¿Eliminar producto?</p>
            <p className="text-white/40 text-sm mb-8">Esta acción no se puede deshacer.</p>

             {deleteError && <p className="text-red-400 text-sm mt-2 mb-4">{deleteError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
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