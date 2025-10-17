'use client';

import { forwardRef } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(({ className = '' }, ref) => {
  return (
    <div ref={ref} className={`flex flex-col items-center justify-center relative z-10 ${className}`}>
      <Image src="/assets/logos/logo-dark.png" alt="Nusa Logo" className="object-contain" width={160} height={160} />
      <p className="text-center text-sm text-text/80 font-normal mt-2">Local Stablecoin Lending Hub</p>
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
