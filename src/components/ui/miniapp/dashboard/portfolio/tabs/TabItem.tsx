import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';

interface TabItemProps {
  token1: string;
  token2: string;
  imageSize: number;
  title: string;
  subtitle: string;
  apy: string;
  apyColor?: string;
}

export default function TabItem({
  token1,
  token2,
  imageSize,
  title,
  subtitle,
  apy,
  apyColor = '#279E73',
}: TabItemProps) {
  return (
    <div className="rounded-2xl border border-white/25 bg-[#f8fafc] p-3">
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <div className="flex items-center">
            <div className="relative flex items-center h-full">
              <div className="overflow-hidden flex items-center" style={{ width: imageSize, height: imageSize }}>
                <TokenNetworkPair tokenLogo={token1} networkLogo={token2} size={imageSize} useOutline={false} />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-black font-semibold text-md">{title}</div>
            <div className="text-sm text-gray-500 font-light">{subtitle}</div>
          </div>
        </div>
        <div className="text-right flex items-center">
          <div className="font-semibold text-[15px]" style={{ color: apyColor }}>
            {apy} APY
          </div>
        </div>
      </div>
    </div>
  );
}
