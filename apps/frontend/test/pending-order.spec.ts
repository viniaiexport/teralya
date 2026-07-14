import { afterEach,describe,expect,it,vi } from 'vitest';
vi.mock('server-only',()=>({}));
const {get,set,remove}=vi.hoisted(()=>({get:vi.fn(),set:vi.fn(),remove:vi.fn()}));
vi.mock('next/headers',()=>({cookies:vi.fn(async()=>({get,set,delete:remove}))}));
import { readPendingOrder,writePendingOrder } from '../src/lib/checkout/pending-order';

afterEach(()=>vi.clearAllMocks());

describe('pedido pendiente de Stripe',()=>{
  it('se guarda en cookie HttpOnly limitada al checkout y treinta minutos',async()=>{await writePendingOrder('22222222-2222-4222-8222-222222222222');expect(set).toHaveBeenCalledWith('teralya_pending_order','22222222-2222-4222-8222-222222222222',expect.objectContaining({httpOnly:true,sameSite:'lax',path:'/checkout',maxAge:1800}))});
  it('ignora valores manipulados antes de consultar confirmación',async()=>{get.mockReturnValue({value:'not-an-order'});await expect(readPendingOrder()).resolves.toBeUndefined();get.mockReturnValue({value:'22222222-2222-4222-8222-222222222222'});await expect(readPendingOrder()).resolves.toBe('22222222-2222-4222-8222-222222222222')});
});
