import { LoginForm } from '../auth-forms';
interface Props{searchParams:Promise<{password?:string|string[]}>}
export default async function AccessPage({searchParams}:Props){const updated=(await searchParams).password==='restablecida';return <><p className="eyebrow">Tu cuenta</p><h1>Acceso a Teralya</h1><p className="auth-intro">Entra para gestionar tus compras o tu bodega.</p>{updated&&<div className="form-status form-success" role="status"><p>Tu contraseña se ha actualizado. Ya puedes iniciar sesión.</p></div>}<LoginForm/></>}
