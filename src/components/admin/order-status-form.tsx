"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { updateOrder } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["unpaid", "pending_verification", "paid", "refunded"];

export function OrderStatusForm({
  id,
  status,
  paymentStatus,
}: {
  id: string;
  status: string;
  paymentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(updateOrder, null);

  return (
    <form action={formAction} className="admin-form-row admin-order-update">
      <input name="id" type="hidden" value={id} />
      <label>
        Order status
        <select defaultValue={status} name="status">
          {orderStatuses.map((value) => (
            <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <label>
        Payment status
        <select defaultValue={paymentStatus} name="paymentStatus">
          {paymentStatuses.map((value) => (
            <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <Button className="admin-submit-button" disabled={pending} type="submit">
        {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}
        {pending ? "Saving…" : "Save status"}
      </Button>
      {state?.error && (
        <p className="admin-action-message error" role="alert">
          <AlertCircle aria-hidden="true" size={16} /> {state.error}
        </p>
      )}
      {state?.success && (
        <p className="admin-action-message success" role="status">
          <CheckCircle2 aria-hidden="true" size={16} /> {state.success}
        </p>
      )}
    </form>
  );
}
