import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const cancelBuyerOrder = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
vi.mock('../src/lib/orders/server', () => ({ cancelBuyerOrder }));
vi.mock('next/navigation', () => ({ redirect }));

const orderId = '22222222-2222-4222-8222-222222222222';

function form(confirmed = true): FormData {
  const value = new FormData();
  value.set('pedido_id', orderId);
  if (confirmed) value.set('confirmacion_cancelacion', 'on');
  return value;
}

afterEach(() => vi.clearAllMocks());

describe('Server Action de cancelación contractual', () => {
  it('redirige al estado real devuelto por API-051 sin convertir el éxito en error', async () => {
    cancelBuyerOrder.mockResolvedValue({ estado: 'completada' });
    const { cancelOrderAction } = await import('../src/app/(buyer)/pedidos/actions');

    await expect(cancelOrderAction(form())).rejects.toThrow(
      `NEXT_REDIRECT:/pedidos/${orderId}?cancelacion=completada`,
    );
    expect(cancelBuyerOrder).toHaveBeenCalledWith(orderId);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('no llama a la API sin confirmación expresa', async () => {
    const { cancelOrderAction } = await import('../src/app/(buyer)/pedidos/actions');
    await expect(cancelOrderAction(form(false))).rejects.toThrow(
      'NEXT_REDIRECT:/pedidos?error=cancelacion',
    );
    expect(cancelBuyerOrder).not.toHaveBeenCalled();
  });

  it('redirige a error cuando API-051 falla', async () => {
    cancelBuyerOrder.mockRejectedValue(new Error('upstream'));
    const { cancelOrderAction } = await import('../src/app/(buyer)/pedidos/actions');
    await expect(cancelOrderAction(form())).rejects.toThrow(
      `NEXT_REDIRECT:/pedidos/${orderId}?error=cancelacion`,
    );
  });
});
