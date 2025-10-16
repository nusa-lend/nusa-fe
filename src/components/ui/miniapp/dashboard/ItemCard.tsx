import Image from 'next/image';

interface ItemCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  apy: string;
  apyColor?: string;
}

export default function ItemCard({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  apy,
  apyColor = '#279E73'
}: ItemCardProps) {
  return (
    <div className="mt-2 bg-[#f8fafc] rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-black font-bold text-md">{title}</div>
            <div className="text-sm text-gray-400 font-light">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#279E73] font-semibold text-md" style={{ color: apyColor }}>
            {apy}
          </div>
        </div>
      </div>
    </div>
  );
}
