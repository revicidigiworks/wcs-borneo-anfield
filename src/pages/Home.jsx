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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 text-center bg-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f0f0f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

      <div className="relative max-w-4xl w-full z-10">

        {/* 🔥 Badge (dikasih jarak biar gak mepet di HP) */}
        <div className="mt-4 sm:mt-0 inline-block px-3 py-1 rounded-full bg-red-50 border border-red-100 mb-6">
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-red-600 uppercase">
            Official Tournament 2026
          </span>
        </div>

        {/* 🔥 LOGO UTAMA (DIBESARIN) */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={logoWCS}
              alt="World Cup Series Logo"
              className="w-44 sm:w-56 md:w-72 object-contain drop-shadow-xl animate-fadeInScale"
            />

            {/* Light Sweep */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="light-sweep"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-2 tracking-tight text-slate-900">
          WORLD CUP <span className="text-red-600">SERIES 2026</span>
        </h1>

        <p className="text-base sm:text-lg md:text-2xl font-light mb-8 text-slate-500 tracking-wide">
          Borneo Anfield Stadium <span className="font-semibold text-yellow-500">2026</span>
        </p>

        {/* 🔥 INFO PREMIUM (DIVIDER KUNING & MOBILE FIX) */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-center">

            <div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-slate-400">
                Registrasi
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                5 Mei – 1 Juni
              </span>
            </div>

            {/* Divider */}
            <span className="text-yellow-500 font-light">|</span>

            <div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-slate-400">
                Kickoff
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                13 Juni 2026
              </span>
            </div>

            {/* Divider */}
            <span className="text-yellow-500 font-light">|</span>

            <div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-slate-400">
                Slot
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                32 Tim
              </span>
            </div>

          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/register")}
          className="group inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 md:py-4 text-sm sm:text-base font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition"
        >
          DAFTAR TIM SEKARANG
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* ORGANIZER */}
        <div className="mt-10 flex flex-col items-center">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mb-2">
            Organized by
          </p>
          <img
            src={logoBAS}
            alt="Organizer Logo"
            className="w-28 sm:w-32 md:w-40 object-contain drop-shadow-md"
          />
        </div>

        {/* 🔥 SPONSOR MARQUEE */}
        <div className="mt-10 overflow-hidden">
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mb-4 text-center">
            Supported by
          </p>

          {/* GLOBAL BACKGROUND + MASK */}
          <div
            className="relative w-full py-4 bg-black overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
            }}
          >

            {/* TRACK */}
            <div className="flex w-max animate-marquee gap-10 px-6">

              {/* LOOP 1 */}
              {sponsors.map((logo, index) => (
                <img
                  key={"a" + index}
                  src={logo}
                  alt="Sponsor"
                  className="h-7 sm:h-8 md:h-10 object-contain"
                />
              ))}

              {/* LOOP 2 */}
              {sponsors.map((logo, index) => (
                <img
                  key={"b" + index}
                  src={logo}
                  alt="Sponsor"
                  className="h-7 sm:h-8 md:h-10 object-contain"
                />
              ))}

            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs sm:text-sm text-slate-400 italic">
          Prepare your squad for the{" "}
          <span className="text-yellow-600 font-medium">
            Ultimate Glory.
          </span>
        </p>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.8s ease-out forwards;
        }

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
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          transform: skewX(-20deg);
          animation: sweep 2.5s ease-in-out infinite;
        }

        @keyframes sweep {
          0% {
            left: -75%;
          }
          50% {
            left: 125%;
          }
          100% {
            left: 125%;
          }
        }
      `}</style>
    </div>
  );
}