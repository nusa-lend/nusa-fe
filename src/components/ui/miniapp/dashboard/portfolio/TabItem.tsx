import TokenNetworkPair from '@/components/ui/miniapp/TokenNetworkPair';

interface TabItemProps {
  token1: string;
  token2: string;
  imageSize: number;
  title: string;
  subtitle: string;
  apy:  string;
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
    <div className="rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[25.3px] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="rounded-full overflow-hidden" style={{ width: imageSize, height: imageSize }}>
              <TokenNetworkPair tokenLogo={token1} networkLogo={token2} size={imageSize} />
            </div>
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
