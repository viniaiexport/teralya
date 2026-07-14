import {describe,expect,it} from 'vitest';
import {securityHeaders} from '../src/lib/security/headers';

describe('cabeceras de seguridad FE-008',()=>{
 it('aplica defensas de navegador sin filtrar tecnología',()=>{const values=Object.fromEntries(securityHeaders.map(header=>[header.key,header.value]));expect(values['X-Content-Type-Options']).toBe('nosniff');expect(values['X-Frame-Options']).toBe('DENY');expect(values['Referrer-Policy']).toBe('strict-origin-when-cross-origin');expect(values['Permissions-Policy']).toContain('camera=()');expect(values['Strict-Transport-Security']).toContain('includeSubDomains')});
 it('restringe embedding, objetos y formularios',()=>{const csp=securityHeaders.find(header=>header.key==='Content-Security-Policy')?.value;expect(csp).toContain("frame-ancestors 'none'");expect(csp).toContain("object-src 'none'");expect(csp).toContain("form-action 'self' https://checkout.stripe.com");expect(csp).not.toContain('*')});
});
