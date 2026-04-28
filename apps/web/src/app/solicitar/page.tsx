"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

type ProfileData = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  floor?: string;
  city: string;
  postalCode: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: string;
  images?: string[];
};

export default function Solicitar() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    talle: "",
    unidad: "cm",
    medicoNombre: "",
    notas: "",
    file: null as File | null,
  });

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Traer productos
  useEffect(() => {
    fetch("/api/solicitudes/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  // Traer perfil del usuario
  useEffect(() => {
    fetch("/api/perfil")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            street: data.address?.street || "",
            number: data.address?.number || "",
            floor: data.address?.floor || "",
            city: data.address?.city || "",
            postalCode: data.address?.postalCode || "",
          });
        }
        setLoadingProfile(false);
      });
  }, []);

  const handleSubmit = async () => {
    const confirmacion = confirm("¿Enviar solicitud al equipo?");
    if (!confirmacion) return;

    setLoading(true);

    

    const body = new FormData();
    body.append("productId", form.productId);
    body.append("talle", form.talle);     
    body.append("tipoMedida", form.unidad);
    body.append("medicoNombre", form.medicoNombre);
    body.append("notas", form.notas);

    if (form.file) {
      body.append("file", form.file);
    }

    const res = await fetch("/api/solicitudes", {
      method: "POST",
      body,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Solicitud enviada correctamente");
      setForm({ ...form, productId: "", talle: "", unidad: "cm", medicoNombre: "", notas: "", file: null });
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex justify-center px-6 pb-20">
        <div className="w-full max-w-xl space-y-12">
          {/* TITULO */}
          <div className="text-center mt-10">
            <h1
              className="text-white text-5xl font-light mb-4"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Solicitar.
            </h1>
            <div className="w-10 h-px bg-white/20 mx-auto" />
          </div>

          {/* DATOS DEL CLIENTE */}
          <div className="border border-white/10 rounded-2xl p-6 space-y-3 bg-white/5">
            <p className="text-xs text-white/40 uppercase tracking-widest">
              Datos del cliente
            </p>

            {loadingProfile ? (
              <p className="text-white/60 text-sm">Cargando...</p>
            ) : profile ? (
              <>
                <p className="text-white font-medium">
                  {profile.name} {profile.lastName}
                </p>
                <p className="text-white/60 text-sm">{profile.email}</p>
                <p className="text-white/60 text-sm">Tel: {profile.phone}</p>
                <p className="text-white/60 text-sm">
                  {profile.street} {profile.number} {profile.floor ? `, ${profile.floor}` : ""}, {profile.city} {profile.postalCode}
                </p>
              </>
            ) : (
              <p className="text-white/60 text-sm">No hay datos disponibles</p>
            )}
          </div>

          {/* FORMULARIO */}
          <div className="space-y-8">

            {/* PRODUCTO */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Producto
              </label>

              <select
                className="w-full bg-black border border-white/20 p-4 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, productId: e.target.value })
                }
                value={form.productId}
              >
                <option value="">Seleccionar</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price}
                  </option>
                ))}
              </select>
            </div>

            {/* TALLE */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Talle
              </label>

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Ej: 26"
                  className="w-2/3 bg-black border border-white/20 p-4 rounded-xl"
                  onChange={(e) =>
                    setForm({ ...form, talle: e.target.value })
                  }
                  value={form.talle}
                />

                <select
                  className="w-1/3 bg-black border border-white/20 p-4 rounded-xl"
                  onChange={(e) =>
                    setForm({ ...form, unidad: e.target.value })
                  }
                  value={form.unidad}
                >
                  <option value="cm">cm</option>
                  <option value="calzado">calzado</option>
                </select>
              </div>

              <p className="text-xs text-white/40">
                Medir una plantilla existente en centímetros para mayor precisión.
              </p>
            </div>

            {/* ARCHIVO */}
            <div className="space-y-3">
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Orden médica
              </label>

              <label className="inline-flex items-center gap-4 border border-white/20 text-white/50 hover:text-white hover:border-white/60 px-6 py-3 text-xs tracking-widest uppercase rounded-full cursor-pointer transition">
                Subir imagen →
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                        alert('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)');
                        return;
                      }
                      setForm({ ...form, file });
                    }
                  }}
                />
              </label>

              <p className="text-xs text-white/40">
                Solo se aceptan imágenes en formato: JPEG, PNG, WebP o GIF. Máximo 5MB.
              </p>

              {form.file && (
                <p className="text-xs text-green-400">
                  ✓ {form.file.name}
                </p>
              )}
            </div>

            {/* MÉDICO */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Médico
              </label>

              <input
                placeholder="Nombre del médico"
                className="w-full bg-black border border-white/20 p-4 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, medicoNombre: e.target.value })
                }
                value={form.medicoNombre}
              />
            </div>

            {/* NOTAS */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Notas
              </label>

              <textarea
                placeholder="Información adicional"
                className="w-full bg-black border border-white/20 p-4 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, notas: e.target.value })
                }
                value={form.notas}
              />
            </div>

            {/* LEYENDA INFORMATIVA */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                ℹ Importante
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Luego de validar tu solicitud, nos pondremos en contacto para indicarte el precio de envío y el total a pagar. Recibirás un email con los detalles y las instrucciones de pago.
              </p>
            </div>

            {/* BOTON FINAL */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-4 border border-white/20 text-white/50 hover:text-white hover:border-white/60 px-8 py-4 text-xs tracking-widest uppercase rounded-full transition"
            >
              {loading ? "Enviando..." : "Enviar solicitud →"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}