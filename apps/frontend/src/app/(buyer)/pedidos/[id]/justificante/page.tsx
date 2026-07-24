import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EconomicDocumentView } from '@/components/economic-document';
import { isUuid } from '@/lib/cart/contracts';
import { getBuyerReceipt } from '@/lib/orders/server';

interface Props {
  params: Promise<{ id: string }>;
}

async function loadReceipt(id: string) {
  try {
    return await getBuyerReceipt(id);
  } catch {
    notFound();
  }
}

export default async function BuyerReceiptPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const document = await loadReceipt(id);

  return (
    <>
      <nav className="breadcrumbs">
        <Link href={`/pedidos/${encodeURIComponent(id)}`}>Volver al pedido</Link>
      </nav>
      <EconomicDocumentView document={document} />
    </>
  );
}
