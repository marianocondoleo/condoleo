"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  phone: string;
  dni: string;
  street: string;
  number: string;
  floor: string;
  city: string;
  postalCode: string;
};

export default function PerfilPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    phone: "", dni: "", street: "", number: "",
    floor: "", city: "", postalCode: "",
  });

  useEffect(() => {
    fetch("/api/perfil")
      .then(r => r.json())
      .then(data => {
        setForm({
          phone: data.user?.phone ?? "",
          dni: data.user?.dni ?? "",
          street: data.address?.street ?? "",
          number: data.address?.number ?? "",
          floor: data.address?.floor ?? "",
          city: data.address?.city ?? "",
          postalCode: data.address?.postalCode ?? "",
        });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isComplete = form.phone && form.dni && form.street && form.number && form.city && form.postalCode;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-8 border-b border-white/5">
        <Link
          href="/"
          className="text-white tracking-[0.3em] uppercase text-sm font-light"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Corte & Co.
        </Link>
        <Link
          href="/catalogo"
          className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors"
        >
          ← Volver al catálogo
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-10 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
          <h1
            className="text-white text-4xl font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Mi perfil
          </h1>
          <div className="w-8 h-px bg-white/20 mt-4" />
        </div>

        {/* Indicador de completitud */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-lg mb-10 text-sm ${
          isComplete
            ? "bg-white/5 border border-white/10 text-white/50"
            : "bg-white/5 border border-white/20 text-white/70"
        }`}>
          <div className={`w-2 h-2 rounded-full ${isComplete ? "bg-green-500" : "bg-orange-400"}`} />
          {isComplete
            ? "Perfil completo — podés realizar pedidos"
            : "Completá tu perfil para poder hacer pedidos"}
        </div>

        {loading ? (
          <div className="text-white/20 text-sm tracking-widest uppercase">Cargando...</div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Datos personales */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Datos personales
              </p>
              <div className="flex flex-col gap-4">
                <Field label="Teléfono *" name="phone" value={form.phone} onChange={handleChange} placeholder="Ej: 1155667788" />
                <Field label="DNI *" name="dni" value={form.dni} onChange={handleChange} placeholder="Ej: 35123456" />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Dirección de entrega
              </p>
              <div className="flex flex-col gap-4">
                <Field label="Calle *" name="street" value={form.street} onChange={handleChange} placeholder="Ej: Av. Santa Fe" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Número *" name="number" value={form.number} onChange={handleChange} placeholder="Ej: 1234" />
                  <Field label="Piso / Depto" name="floor" value={form.floor} onChange={handleChange} placeholder="Ej: 3° B" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ciudad *" name="city" value={form.city} onChange={handleChange} placeholder="Ej: San Isidro" />
                  <Field label="Código Postal *" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Ej: 1642" />
                </div>
              </div>
            </div>

            {/* Medio de pago */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Medio de pago
              </p>
              <div className="flex items-center gap-3 px-5 py-4 border border-white/10 rounded-lg text-white/40 text-sm">
                <span>💳</span>
                Se configura al momento del checkout via MercadoPago
              </div>
            </div>

            {/* Botón guardar */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-4 bg-white text-black text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300 rounded-full disabled:opacity-50"
            >
              {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label, name, value, onChange, placeholder
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/40 text-xs tracking-widest uppercase">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/20 px-4 py-3 rounded-lg text-sm outline-none transition-colors"
      />
    </div>
  );
}