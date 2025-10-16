interface PortfolioCardData {
  title: string;
  value: string;
  sub?: string;
}

interface PortfolioCardsProps {
  data: PortfolioCardData[];
}

export default function PortfolioCards({ data }: PortfolioCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_100%)] backdrop-blur-[25.3px] p-3"
        >
          <div className="text-xs text-gray-600 font-medium mb-1">{item.title}</div>
          <div className="text-lg font-bold text-[#279E73] mb-1">{item.value}</div>
          {item.sub && <div className="text-xs text-[#767676] font-medium">{item.sub}</div>}
        </div>
      ))}
    </div>
  );
}
