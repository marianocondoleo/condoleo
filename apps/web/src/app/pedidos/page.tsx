"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import CarritoIcon from "@/components/CarritoIcon";

type OrderItem = {
  id: string;
  productName: string;
  productImage: string[];
  quantityKg: string;
  unitPrice: string;
};

type Order = {
  id: string;
  status: string;
  total: string;
  deliveryDate: string;
  deliverySlot: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pendiente",
  confirmed: "Confirmado",
  packed:    "Preparando",
  shipped:   "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "text-orange-400 border-orange-400/30 bg-orange-400/10",
  confirmed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  packed:    "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  shipped:   "text-purple-400 border-purple-400/30 bg-purple-400/10",
  delivered: "text-green-400 border-green-400/30 bg-green-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function PedidosPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pedidos")
      .then(r => r.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

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
          <Link href="/catalogo" className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors">
            Catálogo
          </Link>
          <CarritoIcon />
          {user ? (
            <>
              <Link href="/perfil" className="text-white/40 hover:text-white text-xs tracking-widest uppercase font-light transition-colors">
                Mi perfil
              </Link>
              <UserButton />
            </>
          ) : (
            <Link href="/sign-in" className="text-white/70 hover:text-white border border-white/20 hover:border-white/60 px-5 py-2 rounded-full text-xs tracking-widest uppercase font-light transition-all duration-300">
              Ingresar
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-10 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
            Mi cuenta
          </p>
          <h1
            className="text-white text-5xl font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Mis pedidos
          </h1>
          <div className="w-8 h-px bg-white/20 mt-4" />
        </div>

        {loading ? (
          <div className="text-white/20 text-sm tracking-widest uppercase">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <p className="text-white/20 text-lg font-light" style={{ fontFamily: "Georgia, serif" }}>
              Todavía no hiciste ningún pedido
            </p>
            <Link
              href="/catalogo"
              className="border border-white/20 text-white/50 hover:text-white hover:border-white/50 px-8 py-3 rounded-full text-xs tracking-widest uppercase font-light transition-all duration-300"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                {/* Header del pedido */}
                <button
                  onClick={() => setExpandido(expandido === order.id ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-white/30 text-xs font-mono mb-1">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-white text-sm font-light" style={{ fontFamily: "Georgia, serif" }}>
                        {new Date(order.deliveryDate).toLocaleDateString("es-AR", {
                          weekday: "long", day: "numeric", month: "long"
                        })}
                      </p>
                     <p className="text-white/30 text-xs mt-1">
  Franja: {order.deliverySlot}
</p>
{order.metodoPago === "transferencia" && order.status === "pending" && (
  <p className="text-orange-400 text-xs mt-2 flex items-center gap-1">
    ⚠ Recordá enviar el comprobante de transferencia
  </p>
)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_COLOR[order.status] ?? "text-white/30"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <p className="text-white text-lg font-light" style={{ fontFamily: "Georgia, serif" }}>
                      ${Number(order.total).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                    </p>
                    <span className="text-white/20 text-sm">
                      {expandido === order.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {/* Detalle expandible */}
                {expandido === order.id && (
                  <div className="border-t border-white/5 p-5 flex flex-col gap-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-zinc-900 overflow-hidden flex-shrink-0">
                          <img
                            src={item.productImage?.[0] ?? ""}
                            alt={item.productName}
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/80 text-sm font-light" style={{ fontFamily: "Georgia, serif" }}>
                            {item.productName}
                          </p>
                          <p className="text-white/30 text-xs">
                            {Number(item.quantityKg).toFixed(1)} kg · ${Number(item.unitPrice).toLocaleString("es-AR")} / kg
                          </p>
                        </div>
                        <p className="text-white/60 text-sm font-light">
                          ${(Number(item.unitPrice) * Number(item.quantityKg)).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    ))}

                    {order.notes && (
                      <div className="mt-2 pt-3 border-t border-white/5">
                        <p className="text-white/20 text-xs tracking-widest uppercase mb-1">Notas</p>
                        <p className="text-white/40 text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}