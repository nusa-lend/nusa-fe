import React from 'react';
import Image from 'next/image';

interface TokenWithFlagProps {
  tokenLogo: string;
  flag: string;
  tokenAlt?: string;
  flagAlt?: string;
  size?: number;
  flagSize?: number;
  className?: string;
}

const TokenWithFlag: React.FC<TokenWithFlagProps> = ({
  tokenLogo,
  flag,
  tokenAlt = 'Token logo',
  flagAlt = 'Flag',
  size = 48,
  flagSize = 20,
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative">
        <Image src={tokenLogo} alt={tokenAlt} width={size} height={size} className="rounded-full" />

        <div
          className="absolute bottom-0 right-0 rounded-full overflow-hidden shadow-sm"
          style={{
            width: flagSize,
            height: flagSize,
            transform: 'translate(10%, 10%)',
          }}
        >
          <Image src={flag} alt={flagAlt} width={flagSize} height={flagSize} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default TokenWithFlag;
