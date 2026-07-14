import Link from 'next/link';
import { WineryWineForm } from '@/components/winery-wine-form';
interface Props{searchParams:Promise<{error?:string}>}
export default async function NewWinePage({searchParams}:Props){const query=await searchParams;return <section className="private-page"><nav className="breadcrumbs"><Link href="/bodega/vinos">Vinos</Link><span>/</span><span>Nuevo</span></nav><header className="private-heading"><p className="eyebrow">PT-BOD-004</p><h1>Crear vino</h1><p>El vino se guardará como borrador y no se publicará automáticamente.</p></header>{query.error&&<div className="form-status form-error"><p>Revisa los campos obligatorios y sus formatos.</p></div>}<WineryWineForm/></section>}
