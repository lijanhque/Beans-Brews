import Image from "next/image";

export function BrandLogo({
  className,
  width = 112,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      alt="Beans & Brews specialty coffee"
      className={className}
      height={Math.round((width * 2) / 3)}
      sizes={`${width}px`}
      src="/brand-logo.png"
      width={width}
    />
  );
}
