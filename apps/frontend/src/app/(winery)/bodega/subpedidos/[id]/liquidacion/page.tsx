import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EconomicDocumentView } from '@/components/economic-document';
import { isUuid } from '@/lib/cart/contracts';
import { getWineryEconomicDocument } from '@/lib/suborders/server';

interface Props {
  params: Promise<{ id: string }>;
}

async function loadSettlement(id: string) {
  try {
    return await getWineryEconomicDocument(id, 'liquidacion');
  } catch {
    notFound();
  }
}

export default async function WinerySettlementPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const document = await loadSettlement(id);

  return (
    <>
      <nav className="breadcrumbs">
        <Link href={`/bodega/subpedidos/${encodeURIComponent(id)}`}>Volver al SubPedido</Link>
      </nav>
      <EconomicDocumentView document={document} />
    </>
  );
}
