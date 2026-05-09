import { useNavigate } from "react-router-dom";

// IMPORT LOGO
import logoWCS from "../assets/img/logo-wcs.webp";
import logoBAS from "../assets/img/logo-bas.webp";
import logoSalon from "../assets/img/logo-salon.webp";
import logoTravel from "../assets/img/logo-travel.webp";
import logoCafe from "../assets/img/logo-cafe.webp";
import logoWarkop from "../assets/img/logo-warkop.webp";
import logoPickleball from "../assets/img/logo-pickleballhouse.webp";
import logoCoda from "../assets/img/logo-coda.webp";

export default function Home() {
  const navigate = useNavigate();

  const sponsors = [
    logoSalon,
    logoTravel,
    logoCafe,
    logoWarkop,
    logoPickleball,
    logoCoda,
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 font-sans">

      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* ================= HERO ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-16 md:pb-24">

        {/* ================= DESKTOP ================= */}
        <div className="hidden lg:grid grid-cols-[1.1fr_0.9fr] gap-20 items-center">

          {/* LEFT */}
          <div>

            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-slate-200 bg-white mb-8">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>

              <span className="text-[11px] tracking-[0.25em] uppercase font-black text-red-600">
                Official Tournament Mini Soccer
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-[6rem] leading-[0.85] font-black tracking-[-0.06em] uppercase text-slate-950">
              WORLD CUP
              <br />
              <span className="text-red-600">
                SERIES 2026
              </span>
            </h1>

            {/* Venue */}
            <p className="mt-6 text-lg font-bold tracking-[0.28em] uppercase text-yellow-600">
              Borneo Anfield Stadium
            </p>

            {/* Description */}
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-600">
              Open Tournament Mini Soccer. Siapkan strategi terbaik, kumpulkan tim andalanmu, dan buktikan siapa yang layak menjadi juara.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-8 mt-10">

              <button
                onClick={() => navigate("/register")}
                className="group relative overflow-hidden px-10 py-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-[0.2em] uppercase shadow-[0_20px_40px_-10px_rgba(220,38,38,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Daftarkan Sekarang Tim Anda
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {/* Info Minimalis */}
            <div className="flex items-center gap-10 mt-16">

              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-bold mb-2">
                  Registrasi
                </p>

                <h3 className="text-lg font-black text-slate-900">
                  05 MEI — 01 JUN
                </h3>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-bold mb-2">
                  Kick Off
                </p>

                <h3 className="text-lg font-black text-slate-900">
                  13 JUNI 2026
                </h3>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-bold mb-2">
                  Slot
                </p>

                <h3 className="text-lg font-black text-red-600">
                  32 TIM
                </h3>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex justify-center">

            {/* Main Logo */}
            <div className="relative group">

              <img
                src={logoWCS}
                alt="World Cup Series"
                className="w-[420px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105"
              />

              {/* Light Sweep hanya di logo */}
              <div className="light-sweep"></div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="lg:hidden">

          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>

              <span className="text-[10px] tracking-[0.2em] uppercase font-black text-red-600">
                Official Tournament 2026
              </span>
            </div>
          </div>

          {/* Logo */}
          <div className="relative flex justify-center mt-10">
            <div className="relative group">

              <img
                src={logoWCS}
                alt="World Cup Series"
                className="w-56 sm:w-72 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
              />

              {/* Light Sweep */}
              <div className="light-sweep"></div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mt-10">

            <h1 className="text-[3.3rem] sm:text-[4.8rem] leading-[0.9] font-black tracking-[-0.06em] uppercase text-slate-950">
              WORLD CUP
              <br />
              <span className="text-red-600">
                SERIES 2026
              </span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-yellow-600">
              Borneo Anfield Stadium
            </p>

            <p className="mt-6 text-sm leading-7 text-slate-600 max-w-md mx-auto">
              Open Tournament Mini Soccer. Siapkan strategi, kumpulkan tim terbaik, dan buktikan siapa yang layak menjadi juara.
            </p>
          </div>

          {/* Info Minimalis */}
          <div className="flex items-center justify-center gap-5 mt-10 text-center">

            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-2">
                Registrasi
              </p>

              <h3 className="text-[11px] font-black text-slate-900">
                05 MEI — 01 JUN
              </h3>
            </div>

            <div className="w-px h-10 bg-slate-200"></div>

            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-2">
                Kick Off
              </p>

              <h3 className="text-[11px] font-black text-slate-900">
                13 JUNI 2026
              </h3>
            </div>

            <div className="w-px h-10 bg-slate-200"></div>

            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-2">
                Slot
              </p>

              <h3 className="text-[11px] font-black text-red-600">
                32 TIM
              </h3>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <button
              onClick={() => navigate("/register")}
              className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-black tracking-[0.2em] uppercase py-5 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.35)] transition-all duration-300 active:scale-95"
            >
              Daftar Tim Sekarang
            </button>
          </div>
        </div>

        {/* Organized */}
        <div className="mt-20 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-slate-400 mb-5">
            Organized by
          </p>

          <img
            src={logoBAS}
            alt="BAS"
            className="h-16 md:h-20 object-contain mx-auto"
          />
        </div>
      </section>

      {/* ================= SPONSOR ================= */}
<section className="relative z-10 mt-6">

  <p className="text-center text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-6">
    Supported by
  </p>

  {/* Box Hitam */}
  <div className="relative overflow-hidden bg-black py-8 md:py-10 border-y border-white/5">

    {/* Fade Pinggir */}
    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black via-transparent to-black"></div>

    {/* Glow Tipis */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"></div>

    {/* Marquee */}
    <div className="flex w-max animate-marquee items-center gap-14 md:gap-24 px-10">
      {[...sponsors, ...sponsors].map((logo, index) => (
        <img
          key={index}
          src={logo}
          alt="Sponsor"
          className="h-10 sm:h-12 md:h-14 w-auto object-contain"
        />
      ))}
    </div>
  </div>
</section>
{/* ================= FOOTER ================= */}
<footer className="relative z-10 text-center py-24 md:py-32 px-5">

  <div className="flex flex-col items-center gap-7 md:gap-9">

    <p className="text-xl sm:text-2xl md:text-4xl f text-yellow-600 uppercase tracking-[-0.03em] text-slate-900 leading-none">
      #KEEPING THE GAME BEAUTIFUL
    </p>
    <p className="text-xl sm:text-2xl md:text-4xl  text-yellow-600 uppercase tracking-[-0.03em] text-slate-900 leading-none">
      #DEMI HOBI BUKAN GENGSI
    </p>

  </div>
</footer>

      {/* ================= STYLE ================= */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        .light-sweep {
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255,255,255,0.45),
            transparent
          );
          transform: skewX(-20deg);
          animation: sweep 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes sweep {
          0% {
            left: -120%;
          }
          40%, 100% {
            left: 160%;
          }
        }
      `}</style>
    </div>
  );
}