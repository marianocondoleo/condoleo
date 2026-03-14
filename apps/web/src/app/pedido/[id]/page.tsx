"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  status: string;
  metodoPago: string;
  total: string;
};

export default function PedidoConfirmadoPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const mpStatus = searchParams.get("status");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/pedidos/${id}`)
      .then(r => r.json())
      .then(setOrder);
  }, [id]);

  const getMensaje = () => {
    if (!order) return null;

    if (order.metodoPago === "efectivo") {
      return {
        titulo: "¡Pedido confirmado!",
        desc: "Abonás en efectivo al momento de la entrega.",
        color: "text-green-400",
      };
    }
    if (order.metodoPago === "transferencia") {
      return {
        titulo: "Pedido recibido",
        desc: "Envianos el comprobante de transferencia por WhatsApp para confirmar tu pedido.",
        color: "text-orange-400",
      };
    }
    if (mpStatus === "approved") {
      return {
        titulo: "¡Pago acreditado!",
        desc: "Tu pago fue procesado exitosamente.",
        color: "text-green-400",
      };
    }
    if (mpStatus === "pending") {
      return {
        titulo: "Pago en proceso",
        desc: "Tu pago está siendo procesado. Te avisamos cuando se acredite.",
        color: "text-orange-400",
      };
    }
    if (mpStatus === "failure") {
      return {
        titulo: "Pago rechazado",
        desc: "Hubo un problema con el pago. Podés intentarlo nuevamente.",
        color: "text-red-400",
      };
    }
    return {
      titulo: "¡Gracias por tu compra!",
      desc: "Tu pedido fue recibido correctamente.",
      color: "text-white",
    };
  };

  const mensaje = getMensaje();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-10">
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-8 text-2xl ${
          mpStatus === "failure" ? "border-red-400/30" : "border-white/20"
        }`}>
          {mpStatus === "failure" ? "✕" : "✓"}
        </div>

        <p className="text-white/30 tracking-[0.4em] uppercase text-xs mb-4">
          {mpStatus === "failure" ? "Error en el pago" : "Pedido recibido"}
        </p>

        <h1
          className={`text-4xl font-light mb-4 ${mensaje?.color ?? "text-white"}`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {mensaje?.titulo}
        </h1>

        <div className="w-8 h-px bg-white/20 mx-auto my-6" />

        <p className="text-white/40 text-sm font-light mb-2">
          Número de pedido
        </p>
        <p className="text-white/60 text-xs font-mono mb-6">
          {String(id).slice(0, 8).toUpperCase()}
        </p>

        <p className="text-white/30 text-sm font-light mb-10 leading-relaxed">
          {mensaje?.desc}
        </p>
          {order?.metodoPago === "transferencia" && (
  
    href="https://wa.me/5491100000000?text=Hola! Te envío el comprobante del pedido ${String(id).slice(0, 8).toUpperCase()}"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full text-xs tracking-widest uppercase font-medium transition-all duration-300 mb-8"
  >
    📲 Enviar comprobante por WhatsApp
  </a>
)}
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-zinc-200 transition-all duration-300"
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-3 border border-white/20 text-white/50 hover:text-white hover:border-white/50 px-8 py-3 rounded-full text-xs tracking-widest uppercase font-light transition-all duration-300"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}