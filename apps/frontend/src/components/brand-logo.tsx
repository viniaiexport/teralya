import Image from 'next/image';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  full?: boolean;
}

export function BrandLogo({ compact = false, className, full = false }: BrandLogoProps) {
  return (
    <span className={['brand-lockup', compact && 'brand-lockup--compact', full && 'brand-lockup--full', className].filter(Boolean).join(' ')}>
      <Image
        alt="Teralya, el futuro del vino"
        className="brand-logo-artwork"
        height={900}
        priority
        src="/brand/teralya-cristal.png"
        width={900}
      />
    </span>
  );
}
