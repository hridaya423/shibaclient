'use client';

export function ChartSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-6 shadow-lg relative overflow-hidden">
      
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-32"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full"></div>
        </div>
      </div>
      <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded w-48 mb-6"></div>

      
      <div className="h-48 relative bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-4">
          {Array.from({length: 10}, (_, i) => {
            
            const seed = i * 17 + 42; 
            const pseudoRandom = (Math.sin(seed) + 1) / 2; 
            
            const height = Math.round((20 + Math.sin(i * 0.8) * 15 + pseudoRandom * 20) * 10) / 10;
            return (
              <div
                key={i}
                className="bg-gradient-to-t from-pink-200 to-pink-300 rounded-t-sm"
                style={{
                  height: `${height}%`,
                  width: '6%'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-pink-200/50 rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden">
      
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

      <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-20 mb-2"></div>
      <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded w-24"></div>
    </div>
  );
}