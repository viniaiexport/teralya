interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  full?: boolean;
}

export function BrandLogo({ compact = false, className, full = false }: BrandLogoProps) {
  return (
    <span className={['brand-lockup', compact && 'brand-lockup--compact', full && 'brand-lockup--full', className].filter(Boolean).join(' ')}>
      <img
        alt="Teralya, el futuro del vino"
        className="brand-logo-artwork"
        height={900}
        src="/brand/teralya-cristal.svg"
        width={900}
      />
    </span>
  );
}
