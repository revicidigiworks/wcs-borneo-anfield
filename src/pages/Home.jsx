import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center bg-white">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 bg-[radial-gradient(#f0f0f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

      <div className="relative max-w-3xl z-10">
        {/* Badge Section */}
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-red-50 border border-red-100">
          <span className="text-xs font-bold tracking-widest text-red-600 uppercase">
            Official Tournament 2026
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900">
          WORLD CUP <span className="text-red-600">SERIES</span>
        </h1>

        <p className="text-xl md:text-2xl font-light mb-12 text-slate-500 tracking-wide">
          Borneo Anfield <span className="font-semibold text-yellow-500">2026</span>
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: "Registrasi", detail: "5 Mei – 1 Juni", icon: "📅" },
            { label: "Kickoff", detail: "13 Juni 2026", icon: "⚽" },
            { label: "Slot", detail: "32 Tim", icon: "👥" },
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
              <p className="font-bold text-slate-800">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate("/register")}
          className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          DAFTAR TIM SEKARANG
          <svg 
            className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Footer Subtle Hint */}
        <p className="mt-8 text-sm text-slate-400 italic">
          Prepare your squad for the <span className="text-yellow-600 font-medium">Ultimate Glory.</span>
        </p>
      </div>
    </div>
  );
}