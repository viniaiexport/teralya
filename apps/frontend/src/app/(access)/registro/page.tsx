import Link from 'next/link';
import type { Route } from 'next';
import { RegisterForm } from '../auth-forms';
export default function RegisterPage(){return <><p className="eyebrow">Compradores</p><h1>Crea tu cuenta</h1><p className="auth-intro">Compra directamente a bodegas europeas seleccionadas.</p><RegisterForm/><p className="auth-switch">¿Representas a una bodega? <Link href={'/registro/bodega' as Route}>Solicitar acceso profesional</Link></p></>}
