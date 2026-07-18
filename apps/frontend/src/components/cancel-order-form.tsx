"use client";
import { cancelOrderAction } from "@/app/(buyer)/pedidos/actions";

export function CancelOrderForm({ orderId }: { orderId: string }) {
  return (
    <form
      action={cancelOrderAction}
      className="cancellation-form"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "¿Confirmas la cancelación del pedido y la solicitud de reembolso?",
          )
        )
          event.preventDefault();
      }}
    >
      <input name="pedido_id" type="hidden" value={orderId} />
      <h2>Cancelar contrato</h2>
      <p>
        Se detendrá la preparación del pedido en las bodegas implicadas. El
        reembolso se tramitará por el medio de pago original.
      </p>
      <label className="check-field">
        <input name="confirmacion_cancelacion" required type="checkbox" />
        <span>Confirmo que deseo cancelar este pedido.</span>
      </label>
      <button className="button danger" type="submit">
        Cancelar pedido
      </button>
    </form>
  );
}
