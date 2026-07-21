import type { MetadataRoute } from 'next';
import { getCatalog, wineHref, wineryHref } from '@/lib/api/catalog';

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teralya.eu');

function absolute(path: string): string {
  return new URL(path, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicRoutes: MetadataRoute.Sitemap = [
    { url: absolute('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absolute('/vinos'), changeFrequency: 'daily', priority: 0.9 },
    { url: absolute('/bodegas'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absolute('/para-bodegas'), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const catalog = await getCatalog({ page_size: 100 });
    const wineryIds = [...new Set(catalog.items.map((wine) => wine.bodega.id))];
    return [
      ...publicRoutes,
      ...catalog.items.map((wine) => ({
        url: absolute(wineHref(wine.id)),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...wineryIds.map((id) => ({
        url: absolute(wineryHref(id)),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return publicRoutes;
  }
}
