import { ResetForm } from '../auth-forms';
interface Props{searchParams:Promise<{token?:string|string[]}>}
export default async function ResetPage({searchParams}:Props){const raw=(await searchParams).token;const token=Array.isArray(raw)?'':raw??'';return <><p className="eyebrow">Seguridad</p><h1>Nueva contraseña</h1><p className="auth-intro">Elige una contraseña nueva para tu cuenta.</p><ResetForm token={token}/></>}
