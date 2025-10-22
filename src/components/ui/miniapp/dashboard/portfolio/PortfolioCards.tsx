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
        <div key={index} className="rounded-2xl border border-white/25 bg-[#f8fafc] p-3">
          <div className="text-sm text-gray-600 font-medium mb-1">{item.title}</div>
          <div className="text-xl font-bold text-[#175f45] mb-2">{item.value}</div>
          {item.sub && (
            <div className="text-sm text-[#767676] font-medium">
              <span className={`${item.title === 'Lending' ? 'text-green-600' : 'text-red-600'}`}>{item.sub}</span> Avg
              APY
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
