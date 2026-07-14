'use client';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createAddressAction } from '@/app/(buyer)/checkout/actions';
import { initialCheckoutState, type CheckoutActionState } from '@/lib/checkout/contracts';

function Errors({ state, field }: { state: CheckoutActionState; field: string }) {
  const messages = state.fieldErrors[field];
  return messages === undefined ? null : <ul className="field-errors" id={`${field}-errors`}>{messages.map((message) => <li key={message}>{message}</li>)}</ul>;
}

function Field({ state, name, label, required = false, type = 'text', maximum = 200 }: { state: CheckoutActionState; name: string; label: string; required?: boolean; type?: string; maximum?: number }) {
  const invalid = state.fieldErrors[name] !== undefined;
  return <div className="auth-field"><label htmlFor={name}>{label}</label><input aria-describedby={invalid ? `${name}-errors` : undefined} aria-invalid={invalid} id={name} maxLength={maximum} name={name} required={required} type={type}/><Errors field={name} state={state}/></div>;
}

function Submit() {
  const { pending } = useFormStatus();
  return <button className="button primary" disabled={pending} type="submit">{pending ? 'Guardando…' : 'Guardar dirección'}</button>;
}

export function AddressForm({ idempotencyKey }: { idempotencyKey: string }) {
  const [state, action] = useActionState(createAddressAction, initialCheckoutState);
  const [open, setOpen] = useState(false);
  if (!open && state.success === undefined) return <button className="button secondary" onClick={() => setOpen(true)} type="button">Añadir otra dirección</button>;
  return <form action={action} className="address-form">
    <input name="idempotency_key" type="hidden" value={idempotencyKey}/>
    <div className="address-form-heading"><h2>Nueva dirección</h2><button className="text-button" onClick={() => setOpen(false)} type="button">Cerrar</button></div>
    {state.formError !== undefined && <div className="form-status form-error" role="alert"><p>{state.formError}</p>{state.requestId !== undefined && <small>Referencia: {state.requestId}</small>}</div>}
    {state.success !== undefined && <div className="form-status form-success" role="status"><p>{state.success}</p></div>}
    <div className="address-grid">
      <div className="auth-field"><label htmlFor="uso">Uso</label><select id="uso" name="uso" required><option value="ambos">Envío y facturación</option><option value="envio">Solo envío</option><option value="facturacion">Solo facturación</option></select><Errors field="uso" state={state}/></div>
      <Field label="Nombre identificativo" maximum={100} name="nombre_identificativo" state={state}/>
      <Field label="Nombre del destinatario" name="nombre_destinatario" required state={state}/>
      <Field label="Empresa" name="empresa" state={state}/>
      <div className="address-wide"><Field label="Dirección" maximum={500} name="direccion" required state={state}/></div>
      <div className="address-wide"><Field label="Información adicional" maximum={500} name="direccion_adicional" state={state}/></div>
      <Field label="Código postal" maximum={20} name="codigo_postal" required state={state}/>
      <Field label="Ciudad" maximum={100} name="ciudad" required state={state}/>
      <Field label="Provincia" maximum={100} name="provincia" state={state}/>
      <Field label="País" maximum={100} name="pais" required state={state}/>
      <Field label="Teléfono" maximum={50} name="telefono" state={state} type="tel"/>
      <Field label="Correo electrónico" maximum={254} name="email" state={state} type="email"/>
    </div>
    <label className="check-field"><input name="es_principal" type="checkbox"/><span>Usar como dirección principal</span></label>
    <Submit/>
  </form>;
}
