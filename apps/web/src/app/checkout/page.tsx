"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CarritoIcon from "@/components/CarritoIcon";

type ItemCarrito = {
  id: string;
  name: string;
  pricePerKg: string;
  imagen: string;
  cantidad: number;
};

type Perfil = {
  phone: string;
  dni: string;
  street: string;
  number: string;
  floor: string;
  city: string;
  postalCode: string;
};

const FRANJAS = ["8-12hs", "12-16hs", "16-20hs"];

function getFechasDisponibles() {
  const fechas = [];
  const hoy = new Date();
  let dia = new Date(hoy);
  dia.setDate(dia.getDate() + 1);

  while (fechas.length < 10) {
    const dow = dia.getDay();
    if (dow >= 1 && dow <= 6) {
      fechas.push(new Date(dia));
    }
    dia.setDate(dia.getDate() + 1);
  }
  return fechas;
}

function formatFecha(date: Date) {
  return date.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long"
  });
}

function formatFechaCorta(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function CheckoutPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [franjaSeleccionada, setFranjaSeleccionada] = useState("");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fechas = getFechasDisponibles();

  useEffect(() => {
    const raw = localStorage.getItem("carrito");
    setItems(raw ? JSON.parse(raw) : []);

    fetch("/api/perfil")
      .then(r => r.json())
      .then(data => {
        const p = {
          phone: data.user?.phone ?? "",
          dni: data.user?.dni ?? "",
          street: data.address?.street ?? "",
          number: data.address?.number ?? "",
          floor: data.address?.floor ?? "",
          city: data.address?.city ?? "",
          postalCode: data.address?.postalCode ?? "",
        };
        setPerfil(p);
        setPerfilCompleto(!!(p.phone && p.dni && p.street && p.number && p.city && p.postalCode));
      });
  }, []);

  const total = items.reduce((acc, item) => {
    return acc + Number(item.pricePerKg) * item.cantidad;
  }, 0);

  const handleConfirmar = async () => {
    if (!fechaSeleccionada || !franjaSeleccionada) {
  setError("Seleccioná fecha y franja horaria");
  return;
}
if (!metodoPago) {
  setError("Seleccioná un método de pago");
  return;
}
    setError("");
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        deliveryDate: fechaSeleccionada,
        deliverySlot: franjaSeleccionada,
        notes: notas,
        metodoPago,
      }),
    });

    const data = await res.json();
    setLoading(false);

if (data.ok) {
  localStorage.removeItem("carrito");
  window.dispatchEvent(new Event("carrito-actualizado"));
  if (data.redirect) {
    window.location.href = data.redirect; // MercadoPago
  } else {
    router.push(`/pedido/${data.orderId}`);
  }
} else {
      setError(data.error ?? "Error al confirmar el pedido");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-px h-12 bg-white/20 animate-pulse" />
      </div>
    );
  }

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
        <div className="flex items-center gap-6">
          <Link href="/carrito" className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors">
            ← Carrito
          </Link>
          <CarritoIcon />
          {user && <UserButton />}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-10 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
            Último paso
          </p>
          <h1
            className="text-white text-5xl font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Checkout
          </h1>
          <div className="w-8 h-px bg-white/20 mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Columna izquierda */}
          <div className="flex flex-col gap-8">

            {/* Perfil */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Datos de entrega
              </p>
              {perfilCompleto && perfil ? (
                <div className="border border-white/10 rounded-lg p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/20 text-xs tracking-widest uppercase">Dirección</span>
                    <Link href="/perfil" className="text-white/30 hover:text-white text-xs tracking-widest uppercase transition-colors">
                      Editar
                    </Link>
                  </div>
                  <p className="text-white font-light">
                    {perfil.street} {perfil.number}{perfil.floor ? `, ${perfil.floor}` : ""}
                  </p>
                  <p className="text-white/50 text-sm">{perfil.city} · CP {perfil.postalCode}</p>
                  <p className="text-white/50 text-sm">Tel: {perfil.phone}</p>
                </div>
              ) : (
                <div className="border border-white/20 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <p className="text-white/60 text-sm">Completá tu perfil para continuar</p>
                  </div>
                  <Link
                    href="/perfil"
                    className="text-xs tracking-widest uppercase border border-white/20 text-white/50 hover:text-white hover:border-white/50 px-5 py-2 rounded-full transition-all w-fit"
                  >
                    Ir al perfil →
                  </Link>
                </div>
              )}
            </div>

            {/* Fecha */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Fecha de entrega
              </p>
              <div className="flex flex-col gap-2">
                {fechas.slice(0, 6).map(fecha => (
                  <button
                    key={formatFechaCorta(fecha)}
                    onClick={() => setFechaSeleccionada(formatFechaCorta(fecha))}
                    className={`text-left px-5 py-3 rounded-lg border text-sm font-light capitalize transition-all duration-200 ${
                      fechaSeleccionada === formatFechaCorta(fecha)
                        ? "bg-white text-black border-white"
                        : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {formatFecha(fecha)}
                  </button>
                ))}
              </div>
            </div>

            {/* Franja horaria */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Franja horaria
              </p>
              <div className="flex gap-3">
                {FRANJAS.map(franja => (
                  <button
                    key={franja}
                    onClick={() => setFranjaSeleccionada(franja)}
                    className={`flex-1 py-3 rounded-lg border text-xs tracking-widest uppercase font-light transition-all duration-200 ${
                      franjaSeleccionada === franja
                        ? "bg-white text-black border-white"
                        : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {franja}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
                Notas (opcional)
              </p>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Dejar en portería, timbre 2B..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/20 px-4 py-3 rounded-lg text-sm outline-none transition-colors resize-none"
              />
            </div>

          </div>
          {/* Método de pago */}
<div>
  <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
    Método de pago
  </p>
  <div className="flex flex-col gap-2">
    {[
      { id: "mercadopago", label: "MercadoPago", icon: "💳", desc: "Pagá con tu cuenta MP" },
      { id: "tarjeta", label: "Tarjeta", icon: "🏦", desc: "Crédito o débito" },
      { id: "transferencia", label: "Transferencia", icon: "🔄", desc: "CBU / Alias" },
      { id: "efectivo", label: "Efectivo", icon: "💵", desc: "Al momento de la entrega" },
    ].map(metodo => (
      <button
        key={metodo.id}
        onClick={() => setMetodoPago(metodo.id)}
        className={`flex items-center gap-4 px-5 py-4 rounded-lg border text-left transition-all duration-200 ${
          metodoPago === metodo.id
            ? "bg-white text-black border-white"
            : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
        }`}
      >
        <span className="text-xl">{metodo.icon}</span>
        <div>
          <p className={`text-sm font-light ${metodoPago === metodo.id ? "text-black" : "text-white"}`}>
            {metodo.label}
          </p>
          <p className={`text-xs ${metodoPago === metodo.id ? "text-black/50" : "text-white/30"}`}>
            {metodo.desc}
          </p>
        </div>
      </button>
    ))}
  </div>
</div>

          {/* Columna derecha — resumen */}
          <div>
            <p className="text-white/30 tracking-[0.3em] uppercase text-xs mb-5">
              Resumen del pedido
            </p>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border-b border-white/5">
                  <div className="w-12 h-12 rounded bg-zinc-900 overflow-hidden flex-shrink-0">
                    <img src={item.imagen} alt={item.name} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-light" style={{ fontFamily: "Georgia, serif" }}>{item.name}</p>
                    <p className="text-white/30 text-xs">{item.cantidad.toFixed(1)} kg</p>
                  </div>
                  <p className="text-white text-sm font-light">
                    ${(Number(item.pricePerKg) * item.cantidad).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
              <div className="p-5 flex items-center justify-between">
                <p className="text-white/30 text-xs tracking-widest uppercase">Total</p>
                <p className="text-white text-2xl font-light" style={{ fontFamily: "Georgia, serif" }}>
                  ${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs tracking-widest uppercase mt-4">{error}</p>
            )}

            <button
              onClick={handleConfirmar}
              disabled={loading || !perfilCompleto || items.length === 0}
              className="w-full mt-6 py-4 bg-white text-black text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Confirmar pedido →"}
            </button>

            <p className="text-white/20 text-xs text-center mt-4">
              El pago se procesa via MercadoPago en el siguiente paso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}