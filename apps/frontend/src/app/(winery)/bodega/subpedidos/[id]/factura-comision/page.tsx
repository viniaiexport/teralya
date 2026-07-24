import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EconomicDocumentView } from '@/components/economic-document';
import { isUuid } from '@/lib/cart/contracts';
import { getWineryEconomicDocument } from '@/lib/suborders/server';

interface Props {
  params: Promise<{ id: string }>;
}

async function loadCommissionInvoice(id: string) {
  try {
    return await getWineryEconomicDocument(id, 'factura-comision');
  } catch {
    notFound();
  }
}

export default async function WineryCommissionInvoicePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const document = await loadCommissionInvoice(id);

  return (
    <>
      <nav className="breadcrumbs">
        <Link href={`/bodega/subpedidos/${encodeURIComponent(id)}`}>Volver al SubPedido</Link>
      </nav>
      <EconomicDocumentView document={document} />
    </>
  );
}
