import React from 'react';
import Image from 'next/image';

interface TokenNetworkPairProps {
  tokenLogo: string;
  networkLogo: string;
  size?: number;
  overlap?: number;
  className?: string;
  tokenClassName?: string;
  networkClassName?: string;
  useOutline?: boolean;
}

const TokenNetworkPair: React.FC<TokenNetworkPairProps> = ({
  tokenLogo,
  networkLogo,
  size = 48,
  overlap = 25,
  className = '',
  tokenClassName = '',
  networkClassName = '',
  useOutline = true,
}) => {
  const overlapOffset = (size * overlap) / 100;

  const getTokenName = (path: string) => {
    const filename = path.split('/').pop()?.split('.')[0] || 'token';
    return filename.charAt(0).toUpperCase() + filename.slice(1);
  };

  const tokenAlt = `${getTokenName(tokenLogo)} token`;
  const networkAlt = `${getTokenName(networkLogo)} network`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className={`relative ${tokenClassName}`} style={{ zIndex: 1 }}>
        <Image src={tokenLogo} alt={tokenAlt} width={size} height={size} className="rounded-full" />
      </div>

      <div
        className={`relative ${networkClassName}`}
        style={{
          zIndex: 2,
          marginLeft: `-${overlapOffset}px`,
        }}
      >
        {useOutline ? (
          <Image
            src={networkLogo}
            alt={networkAlt}
            width={size + 4}
            height={size + 4}
            className="rounded-full border-2 border-white"
          />
        ) : (
          <Image src={networkLogo} alt={networkAlt} width={size} height={size} className="rounded-full" />
        )}
      </div>
    </div>
  );
};

export default TokenNetworkPair;
