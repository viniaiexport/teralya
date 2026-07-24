import Link from 'next/link';
import { getStripeConnectStatus } from '@/lib/winery/server';
import { startStripeOnboardingAction } from './actions';

interface Props{searchParams:Promise<{error?:string;stripe?:string}>}

const labels={
  no_iniciada:'No iniciada',
  pendiente:'Pendiente de datos',
  en_revision:'En revisión',
  activa:'Activa',
  restringida:'Restringida',
  suspendida:'Suspendida',
} as const;

export default async function WineryPaymentsPage({searchParams}:Props){
  const query=await searchParams;
  let status;
  try{status=await getStripeConnectStatus()}catch{return <section className="screen-state screen-state-error"><h1>No hemos podido consultar Stripe Connect</h1><Link className="button secondary" href="/bodega/pagos">Reintentar</Link></section>}
  return <section className="private-page">
    <nav className="breadcrumbs"><Link href="/bodega">Panel</Link><span>/</span><span>Pagos</span></nav>
    <header className="private-heading"><p className="eyebrow">Cobros de bodega</p><h1>Stripe Connect</h1><p>Vincula la cuenta bancaria de la bodega para recibir automáticamente el 85 % del vino y el transporte correspondiente.</p></header>
    {query.error&&<div className="form-status form-error"><p>No se ha podido iniciar la vinculación. Inténtalo de nuevo.</p></div>}
    {query.stripe==='return'&&<div className="form-status form-success"><p>Stripe ha devuelto el control a Teralya. El estado actualizado aparece debajo.</p></div>}
    <article className="private-card">
      <p className="card-kicker">Estado de cobros</p>
      <h2>{labels[status.estado]}</h2>
      <dl>
        <div><dt>Identidad verificada</dt><dd>{status.cuenta_verificada?'Sí':'Pendiente'}</dd></div>
        <div><dt>Cargos habilitados</dt><dd>{status.cargos_habilitados?'Sí':'Pendiente'}</dd></div>
        <div><dt>Transferencias habilitadas</dt><dd>{status.cobros_habilitados?'Sí':'Pendiente'}</dd></div>
      </dl>
      {status.puede_cobrar?<p className="form-status form-success">La bodega puede recibir liquidaciones.</p>:<form action={startStripeOnboardingAction}><button className="button primary" type="submit">{status.estado==='no_iniciada'?'Vincular Stripe':'Continuar en Stripe'}</button></form>}
    </article>
    <p className="form-help">Teralya no almacena datos bancarios. La identificación y la cuenta de cobro se gestionan en Stripe.</p>
  </section>;
}
