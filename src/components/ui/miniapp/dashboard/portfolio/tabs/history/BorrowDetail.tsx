'use client';

export default function BorrowDetail() {
  return (
    <div className="w-full pb-4 bg-white">
      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-3 space-y-2">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Borrow Rate</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>APR</span>
              <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">i</span>
              </div>
            </div>
            <span className="text-red-600 font-semibold text-[15px]">~0.03%</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Collateral</span>
            <span className="text-black font-semibold text-[15px]">bNVDA 100</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Borrowing</span>
            <span className="text-black font-semibold text-[15px]">IDRX 16,500,000</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Duration</span>
            <span className="text-black font-semibold text-[15px]">3M:11D:8H</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Interest</span>
            <span className="text-black font-semibold text-[15px]">IDRX 3,500</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Start Date</span>
            <span className="text-black font-semibold text-[15px]">15/09/2025</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>End Date</span>
            <span className="text-black font-semibold text-[15px]">15/12/2025</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {}}
        className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white transition mt-3 ${'bg-[#56A2CC] hover:bg-[#56A2CC]/80'}`}
      >
        Borrow More
      </button>
    </div>
  );
}
