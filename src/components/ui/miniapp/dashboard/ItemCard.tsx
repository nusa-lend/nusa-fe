import Image from 'next/image';
import { Wallet } from 'lucide-react';
import { formatBalance } from '@/utils/formatBalance';

interface ItemCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  apy: string;
  apyColor?: string;
  imageSize?: number;
  flagSrc?: string;
  flagSize?: number;
  isLoading?: boolean;
}

export default function ItemCard({
  imageSrc,
  title,
  subtitle,
  apy,
  apyColor = '#279E73',
  imageSize = 48,
  flagSrc,
  flagSize = 16,
  isLoading = false,
}: ItemCardProps) {
  return (
    <div className="mt-2 bg-[#f8fafc] rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="rounded-full overflow-hidden" style={{ width: imageSize, height: imageSize }}>
              <Image
                src={imageSrc}
                alt={`${title} logo`}
                width={imageSize}
                height={imageSize}
                className="w-full h-full object-cover"
              />
            </div>
            {flagSrc && (
              <div
                className="absolute bottom-0 right-0 rounded-full overflow-hidden shadow-sm"
                style={{
                  width: flagSize,
                  height: flagSize,
                  transform: 'translate(10%, 10%)',
                }}
              >
                <Image
                  src={flagSrc}
                  alt={`${title} flag`}
                  width={flagSize}
                  height={flagSize}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <div className="text-black font-bold text-md">{title}</div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-24 mt-1"></div>
              </div>
            ) : (
              <div className="text-[14px] text-gray-400 font-light flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                {formatBalance(subtitle)}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-md" style={{ color: apyColor }}>
            {apy}
          </div>
        </div>
      </div>
    </div>
  );
}
