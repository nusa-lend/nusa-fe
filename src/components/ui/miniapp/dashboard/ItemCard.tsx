import Image from 'next/image';

interface ItemCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  apy: string;
  apyColor?: string;
  imageSize?: number;
  flagSrc?: string;
  flagSize?: number;
}

export default function ItemCard({
  imageSrc,
  title,
  subtitle,
  apy,
  apyColor = '#279E73',
  imageSize = 48,
  flagSrc,
  flagSize = 20,
}: ItemCardProps) {
  return (
    <div className="mt-2 bg-[#f8fafc] rounded-xl p-4">
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
            <div className="text-sm text-gray-400 font-light">{subtitle}</div>
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
