import { useState, useMemo, useRef, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Link, Navigate, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ProductPage from "./ProductPage";
import Admin from "./Admin";
import Login from "./Login";
import {
  auth,
  mapCategoryDocument,
  mapProductDocument,
  mapSocialDocument,
  subscribeToCategories,
  subscribeToProducts,
  subscribeToSocial,
  SOCIAL_DEFAULTS,
} from "./firebase";
import { getProductSlug } from "./utils/slug";

function HeroVideo({ videoId }) {
  const resolvedVideoId = (videoId || STATIC_STORE.social.videoId || "").trim();

  if (!resolvedVideoId) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pt-4">
      <div className="rounded-2xl overflow-hidden shadow border border-green-100">
        <div className="relative aspect-video bg-black w-full">
          <iframe
            src={`https://www.youtube.com/embed/${resolvedVideoId}?rel=0`}
            className="absolute inset-0 w-full h-full"
            title="Video principal"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
function ShortsRow({ social }) {
  const [interactiveId, setInteractiveId] = useState(null);

  const shorts = Array.isArray(social?.shorts)
    ? social.shorts.filter((value) => typeof value === "string" && value.trim() !== "")
    : [];

  if (!shorts.length) {
    return null;
  }

  const youtubeLink = (social?.youtube || STATIC_STORE.social.youtube || "").trim();

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-2">
        <h3 className="text-lg font-extrabold text-green-800">Shorts</h3>
        {youtubeLink && (
          <a
            href={youtubeLink}
            target="_blank" rel="noreferrer"
            className="text-green-700 text-sm hover:underline"
          >
            Ver canal +
          </a>
        )}
      </div>

      <HSlider step={320}>
        {shorts.map((id) => (
          <div
            key={id}
            className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow border border-green-100 p-2"
          >
            <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[9/16]">
              <iframe
                src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
                className={`absolute inset-0 w-full h-full ${interactiveId === id ? 'pointer-events-auto' : 'pointer-events-none'}`}
                title={`Short ${id}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              {interactiveId !== id && (
                <button
                  onClick={() => setInteractiveId(id)}
                  className="absolute inset-0 grid place-content-center text-white/95 text-sm font-semibold bg-black/30"
                >
                  Toca para reproducir
                </button>
              )}
            </div>
          </div>
        ))}
      </HSlider>
    </section>
  );
}


const IconMenu = ({ className="h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = ({ className="h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconInstagram = ({ className="h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
);
const IconYouTube = ({ className="h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M23 12s0-3.6-.46-5.19a2.86 2.86 0 0 0-2-2C18.9 4.27 12 4.27 12 4.27s-6.9 0-8.54.54a2.86 2.86 0 0 0-2 2C.99 8.4 1 12 1 12s0 3.6.46 5.19a2.86 2.86 0 0 0 2 2C5.1 19.73 12 19.73 12 19.73s6.9 0 8.54-.54a2.86 2.86 0 0 0 2-2C23 15.6 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z"/>
  </svg>
);

const IconWhatsApp = ({ className = "h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M20.52 3.48A11.77 11.77 0 0 0 12.06 1 11.94 11.94 0 0 0 2 12a11.76 11.76 0 0 0 1.64 6L2 23l5.11-1.33A12.08 12.08 0 0 0 12.06 23h.05A11.94 11.94 0 0 0 23 11.95a11.77 11.77 0 0 0-2.48-8.47ZM12.11 21a9.92 9.92 0 0 1-5.05-1.39l-.36-.21-3 .78.8-2.92-.23-.38A9.76 9.76 0 0 1 4 12 9.94 9.94 0 0 1 12.06 3 9.77 9.77 0 0 1 21 12a9.94 9.94 0 0 1-8.89 9ZM17.4 14.22c-.3-.15-1.78-.88-2.05-.98s-.47-.15-.67.15-.77.98-.94 1.18-.35.23-.65.08a8.07 8.07 0 0 1-2.37-1.47 8.8 8.8 0 0 1-1.63-2c-.17-.3 0-.45.13-.6s.3-.35.45-.52a1 1 0 0 0 .3-.52.57.57 0 0 0-.03-.52c-.08-.15-.67-1.62-.92-2.22s-.5-.45-.67-.46h-.58a1.11 1.11 0 0 0-.8.38 3.37 3.37 0 0 0-1.05 2.5 5.86 5.86 0 0 0 1.24 3.09c.15.2 2.4 3.66 5.82 5a19.91 19.91 0 0 0 2 .74 4.7 4.7 0 0 0 2.16.14 3.53 3.53 0 0 0 2.31-1.63 3 3 0 0 0 .21-1.62c-.1-.15-.27-.23-.57-.38Z"/>
  </svg>
);

const IconPhone = ({ className = "h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.59-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.59A2 2 0 0 1 4.16 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.77.7 2.6a2 2 0 0 1-.45 2.11L8.09 9.75a16 16 0 0 0 6.16 6.16l1.32-1.32a2 2 0 0 1 2.11-.45c.83.34 1.7.58 2.6.7A2 2 0 0 1 22 16.92Z"/>
  </svg>
);

// Icono de lupa para el buscador
const IconSearch = ({ className = "h-4 w-4", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconSewingMachine = ({ className = "h-6 w-6", ...props }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="8" y="20" width="48" height="20" rx="2" ry="2" />
    <circle cx="20" cy="30" r="3" />
    <path d="M56 24v12M8 40v4h48v-4" />
  </svg>
);

const IconGear = ({ className = "h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.5 1.2.66 1.82.33h.09c.61-.24 1-.84 1-1.51V3a2 2 0 1 1 4 0v.09c0 .67.39 1.27 1 1.51.45.18.95.11 1.34-.16.39.27.89.34 1.34.16l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.27.39-.34.89-.16 1.34.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.67 0-1.27.39-1.51 1z" />
  </svg>
);

const IconSpool = ({ className = "h-6 w-6", ...props }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="12" y="8" width="40" height="8" rx="2" />
    <rect x="12" y="48" width="40" height="8" rx="2" />
    <line x1="12" y1="16" x2="12" y2="48" />
    <line x1="52" y1="16" x2="52" y2="48" />
    <line x1="20" y1="20" x2="44" y2="44" />
    <line x1="20" y1="44" x2="44" y2="20" />
  </svg>
);

const IconFabricRoll = ({ className = "h-6 w-6", ...props }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="8" y="16" width="40" height="32" rx="4" />
    <circle cx="48" cy="32" r="8" />
    <path d="M56 24v16" />
  </svg>
);

const IconShoppingCart = ({ className = "h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 11.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

 

const IconScissors = ({ className = "h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="14" cy="6" r="3" />
    <path d="M8.5 8.5L21 21" />
    <path d="M21 3l-9 9" />
  </svg>
);

const IconWrench = ({ className = "h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14.7 6.3a5 5 0 1 1-4.4 8.4L3 22l.9-7.3A5 5 0 0 1 14.7 6.3z" />
  </svg>
);

const IconPackage = ({ className = "h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" />
    <path d="M7.5 4.21L12 6.5l4.5-2.29" />
  </svg>
);
const IconNeedle = ({ className = "h-5 w-5", ...props }) => (

  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>

    <path d="M2 22c0-4 8-14 14-18" />

    <path d="M20 4l0 4" />

    <path d="M17 7l3 3" />

  </svg>

);



const IconShirt = ({ className = "h-5 w-5", ...props }) => (

  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>

    <path d="M4 7l5-3 3 2 5-2 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />

  </svg>

);



const CATEGORY_ICON_MAP = {
  gear: IconGear,
  scissors: IconScissors,
  shirt: IconShirt,
  needle: IconNeedle,
  package: IconPackage,
};

const getCategoryIcon = (iconKey) => CATEGORY_ICON_MAP[iconKey] || IconGear;


const slugify = (s) =>
  s.toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Choose an icon based on the category name
const iconFor = (name) => {
  const s = slugify(name || "");
  if (s.includes("cortadora")) return IconScissors;
  if (s.includes("fileteadora")) return IconScissors;
  if (s.includes("bordadora")) return IconNeedle;
  if (s.includes("planchas")) return IconShirt;
  if (s.includes("lamparas")) return IconShirt;
  if (s.includes("maquinas") || s.includes("plana")) return IconGear;
  return IconGear;
};
 // Fix common UTF-8/Latin1 accent issues in provided data
function normalizeText(s) {
  if (typeof s !== 'string') return s;
  try {
    const decoded = decodeURIComponent(escape(s));
    return decoded
      .replace(/\uFFFD/g, '')
      .replace(/\u20AC\u00A2/g, '•')
      .replace(/[\u2013\u2014]/g, '–');
  } catch (e) {
    return s;
  }
}

// Additional cleanup for common Spanish mojibake and typos
function fixCopy(s) {
  if (typeof s !== 'string') return s;
  let out = s;
  const pairs = [
    ['Bogot�','Bogotá'], ['S�guenos','Síguenos'],
    ['mA�s','más'], ['MA�s','Más'],
    ['A3n','ón'], ['A3N','ÓN'], ['A3s','ós'], ['A3S','ÓS'],
    ['dA-a','día'],
    ['domAcstica','doméstica'], ['DomAcstica','Doméstica'],
    ['electrA3nica','electrónica'], ['ElectrA3nica','Electrónica'],
    ['informaciA3n','información'], ['InformaciA3n','Información'],
    ['DirecciA3n','Dirección'], ['TelAcfono','Teléfono'],
    ['prAcnsatelas','prensatelas'], ['muA�ecos','muñecos'],
    ['chasA-s','chasis'], ['rA-gido','rígido'],
    ['categor�a','categoría'], ['Categor�a','Categoría'],
    ['mA�quina','máquina'], ['MA�quina','Máquina'],
    ['mA�quinas','máquinas'], ['MA�quinas','Máquinas'],
    ['Lamparas','Lámparas'], ['Collarin','Collarín'],
    ['Electronicas','Electrónicas'], ['Mecatronicas','Mecatrónicas'],
    ['Maquinas','Máquinas'],
  ];
  for (const [bad, good] of pairs) {
    out = out.split(bad).join(good);
  }
  return out;
}

const IconTikTok = ({ className="h-5 w-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M16 3a5 5 0 0 0 4 4.9v2.1a8.1 8.1 0 0 1-4-1.1v6a6 6 0 1 1-6-6c.35 0 .68.03 1 .08v2.27A3.8 3.8 0 0 0 10 11a4 4 0 1 0 4 4V3h2z"/>
  </svg>
);
// Flechas para sliders
const IconChevronLeft = ({ className="h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const IconChevronRight = ({ className="h-6 w-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/** Slider horizontal con scroll independiente + flechas **/
/** Slider horizontal con scroll independiente + flechas (mobile-friendly) **/
function HSlider({ children, step = 0 }) {
  const ref = useRef(null);
  const [computedStep, setComputedStep] = useState(240);

  useEffect(() => {
    const el = ref.current?.querySelector(':scope > *');
    if (el) {
      const gap = 12; // coincide con gap-3
      const w = el.getBoundingClientRect().width + gap;
      if (w > 0) setComputedStep(Math.round(w));
    }
  }, [children]);

  const getStep = () => (step && step > 0 ? step : computedStep);
  const go = (dx) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <div className="relative">
      <div
        ref={ref}
        className="w-full flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        {children}
      </div>

      {/* Flechas (se muestran desde sm hacia arriba) */}
      <button
        aria-label="Anterior"
        onClick={() => go(-getStep())}
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
      >
        <IconChevronLeft />
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => go(getStep())}
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}



/** Slider vertical con scroll independiente (para grillas largas) **/
function VSlider({ children, maxHeight = "70vh", scrollable = false }) {
  const scrollClass = scrollable ? "w-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden" : "w-full";
  const scrollStyle = scrollable ? {
    maxHeight,
    scrollbarWidth: "none",
    overscrollBehaviorY: "contain",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-y", // <- bloquea el scroll horizontal accidental
  } : undefined;

  return (
    <div
      className={scrollClass}
      style={scrollStyle}
      onWheel={scrollable ? (e) => e.stopPropagation() : undefined}
      onTouchMove={scrollable ? (e) => e.stopPropagation() : undefined}
    >
      {children}
    </div>
  );
}


// ------------------------- Store data -------------------------
const STATIC_STORE = {
  name: "Senalmaq",
  address: "Cra 108a # 139-05 / Calle 139 # 103f 13, Suba, Bogotá, Colombia.",
  phone: "+57 317 6693030",
  email: "Cosersenalmaq@gmail.com ",
  // WhatsApp must be a wa.me link (no spaces). Keep the international code.
  whatsapp: "https://wa.me/573176693030",
   social: {
    instagram: "https://www.instagram.com/senalmaq",
    youtube: "https://www.youtube.com/@senalmaqcoser",         // <-- pon tu canal
    videoId: "JzGMhsTBoWM", 
    tiktok:    "https://www.tiktok.com/@senalmaq",     // <-- Cambia por tu cuenta real
    shorts:    ["K1_3Osgn9MU", "DRJlx83svFU", "IoJ3ppFo6vQ"]
      },

};

// TODO: remove legacy alias once all references are migrated.
const STORE = STATIC_STORE;

const FALLBACK_CATEGORIES = [
  { name: "Maquinas De Coser Singer", icon: IconGear },
  { name: "Maquinas De Coser Brother", icon: IconGear },
  { name: "Planas Mecatronicas", icon: IconGear },
  { name: "Maquinas Electronicas",icon: IconGear },
  { name: "Fileteadoras Mecatronicas", icon: IconGear },
  { name: "Fileteadoras Familiares", icon: IconGear },
  { name: "Bordadoras", icon: IconShirt },
  { name: "Cortadoras De Tela", icon: IconScissors },
  { name: "Planchas", icon: IconShirt },
  { name: "Accesorios Extras", icon: IconShirt },
  { name: "Lamparas", icon: IconShirt },
  { name: "Collarin Industrial", icon: IconGear },
  { name: "Planas Electronicas", icon: IconGear },
  { name: "Cortadora Vertical", icon: IconGear },
  { name: "Maquinas 20u", icon: IconGear },
  { name: "Maquinas Para Trabajo Pesado", icon: IconGear },

];
const STATIC_PRODUCTS = [
  {
    id: 1,
    name: "Bordadora Brother NS150",
    price: 5900000,
    image: "/images/NS1250.png",
    icon: IconPackage,
    category: "Bordadoras",
    description: "Bordadora familiar y profesional ligera, ideal para personalizar prendas y proyectos de confecciÃ³n. Ofrece funciones faciles de usar y excelentes acabados para bordados decorativos y monogramas.",
  },
  {
    id: 2,
    name: "Bordadora Familiar Brother PE545",
    price: 3350000,
    image: "/images/PE545.png",
    icon: IconPackage,
    category: "Bordadoras",
    description: "Bordadora domÃ©stica con interfaz intuitiva y varias opciones de diseÃ±o. Perfecta para emprendedores y aficionados que necesitan resultados profesionales en trabajos pequeÃ±os y medianos.",
  },
  {
    id: 3,
    name: "Bordadora Industrial Kansew 15 Agujas",
    price: 1000,
    image: "/images/bordadora15agujas.png",
    icon: IconPackage,
    category: "Bordadoras",
    description: "Equipo industrial de alta productividad con 15 agujas para bordados multicolores continuos. DiseÃ±ada para talleres grandes y producciÃ³n en serie con precisiÃ³n y velocidad.",
  },
  {
    id: 4,
    name: "Bordadora Kansew 9 Hilos",
    price: 1000,
    image: "/images/9hilos.png",
    icon: IconPackage,
    category: "Bordadoras",
    description: "Bordadora robusta para producciÃ³n y talleres, ideal para trabajos con mÃºltiples colores y acabados profesionales. ConstrucciÃ³n durable pensada para uso prolongado.",
  },
  {
    id: 5,
    name: "Brother 3701",
    price: 920000,
    image: "/images/3701.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina domÃ©stica versÃ¡til con funciones sencillas y buen rendimiento para costura del dÃ­a a dÃ­a. Perfecta para principiantes que buscan durabilidad y facilidad de uso.",
  },
  {
    id: 6,
    name: "Brother BM 3850",
    price: 1210000,
    image: "/images/bm3850.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina de coser domÃ©stica mecÃ¡nica BROTHER BM3850. Esta fuerte y completa mÃ¡quina incorpora 37 puntadas decorativas ideales para personas que quieran trabajar lencerÃ­a infantil, lencerÃ­a de hogar, algunos acolchados, proyectos de navidad, muÃ±ecos medianos y confecciÃ³n de todo tipo de prendas €“ telas medianas. El manejo es sencillo gracias al enhebrador automÃ¡tico y al sistema de enhebrado de carretel Quick-step . Incluye 8 pies prÃ©nsatelas entre los que destacan pie de doble arrastre (tractor), bordado libre, puntada invisible, dobladillo, ojal y pegado de botÃ³n.",
  },
  {
    id: 7,
    name: "Brother BM3700",
    price: 1050000,
    image: "/images/bm3700.png",
    icon: IconPackage,
    category: "maquinas De Coser Brother",
    description: "MÃ¡quina de coser domÃ©stica mecÃ¡nica BROTHER XM3700. Esta mÃ¡quina intermedia incorpora 37 puntadas decorativas ideales para personas que quieran trabajar lencerÃ­a infantil, lencerÃ­a de hogar, algunos acolchados, proyectos de navidad, muÃ±ecos medianos y confecciÃ³n de todo tipo de prendas €“ telas medianas. El manejo es sencillo gracias al enhebrador automÃ¡tico y al sistema de enhebrado de carretel Quick-step . Incluye 6 pies prÃ©nsatelas entre los que destacan los pies de puntada invisible, dobladillo, cremallera, ojal y pegado de botÃ³n.",
  },
  {
    id: 8,
    name: "Brother CP60X",
    price: 1350000,
    image: "/images/cp60x.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina de coser domÃ©stica computarizada BROTHER CP60X . Esta hermosa mÃ¡quina incorpora 60 puntadas decorativas  ideales para personas que quieran trabajar manualidades en el hogar, patchwork, quilting, lencerÃ­a de hogar, muÃ±ecos medianos y confecciÃ³n de todo tipo de prendas €“ telas medianas. Esta hermosa mÃ¡quina es una de las mÃ¡quinas mÃ¡s sencillas de manejar a nivel de hogar al incorporar enhebrador automÃ¡tico y sistemas de dientes retractiles. Incluye 07 pies prÃ©nsatelas incluyendo pie abierto, imitaciÃ³n filete, ojal y pegado de botÃ³n.",
  },
  {
    id: 9,
    name: "Brother CP80X",
    price: 1350000,
    image: "/images/cp80x.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina de coser domÃ©stica computarizada BROTHER CP80X . Esta hermosa mÃ¡quina incorpora 80 puntadas decorativas  ideales para personas que quieran trabajar manualidades en el hogar, patchwork, quilting, lencerÃ­a de hogar, muÃ±ecos medianos y confecciÃ³n de todo tipo de prendas €“ telas medianas. Esta hermosa y moderna mÃ¡quina es una de las mÃ¡quinas mÃ¡s sencillas de manejar a nivel de hogar al incorporar enhebrador automÃ¡tico y sistemas de dientes retractiles. Incluye 7 pies prÃ©nsatelas incluyendo pie abierto, imitaciÃ³n filete, ojal y pegado de botÃ³n. La CP80X pertenece a un nuevo concepto de mÃ¡quinas computarizadas con chasÃ­s rÃ­gido tipo bordadora, mÃ¡s estable y duradera.",
  },
  {
    id: 10,
    name: "Brother CS7205",
    price: 1900000,
    image: "/images/cs705.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina electrÃ³nica con mÃºltiples funciones y acabado profesional en costuras. Pensada para usuarios avanzados que requieren precisiÃ³n y variedad de puntadas.",
  },
  {
    id: 11,
    name: "Brother CE1150",
    price: 1300000,
    image: "/images/ce1150.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina de coser domÃ©stica computarizada BROTHER CE1150 . Esta hermosa mÃ¡quina incorpora 110 puntadas decorativas  ideales para personas que quieran trabajar manualidades en el hogar, patchwork, quilting, lencerÃ­a de hogar, muÃ±ecos medianos y confecciÃ³n de todo tipo de prendas €“ telas medianas. Esta hermosa mÃ¡quina es una de las mÃ¡quinas mÃ¡s sencillas de manejar a nivel de hogar al incorporar enhebrador automÃ¡tico y sistemas de dientes retractiles. Incluye 06 pies prÃ©nsatelas incluyendo pie abierto, imitaciÃ³n filete, ojal y pegado de botÃ³n. La CE1150 es un nuevo concepto de mÃ¡quinas computarizadas con chasÃ­s rÃ­gido tipo bordadora, mÃ¡s estable y duradera.",
  },
  {
    id: 12,
    name: "Brother GX37",
    price: 820000,
    image: "/images/gx37.png",
    icon: IconShirt,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina ligera y prÃ¡ctica con 37 puntadas integradas y funciones amigables para principiantes. Excelente relaciÃ³n calidad-precio para tareas domÃ©sticas y proyectos creativos.",
  },
  {
    id: 13,
    name: "Brother HC1850",
    price: 1700000,
    image: "/images/hc1850.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "Perfecto para coser, acolchar y monogramas bÃ¡sicos! El HC1850 presenta 185 puntadas Ãºnicas, incluidas 55 puntadas de costura alfanumÃ©ricas para monogramas bÃ¡sicos y 8 estilos de ojales de un solo paso. DiseÃ±ada para ofrecer flexibilidad y facilidad de uso, esta mÃ¡quina incluye un prÃ¡ctico rotafolio de referencia de puntada incorporado, 8 pies prensatelas, selector de puntadas con botÃ³n, velocidad de costura ajustable, sistema de enhebrado automÃ¡tico, controlador de pie desmontable y un sistema de alimentaciÃ³n excepcional para coser en casi cualquier tela. Las caracterÃ­sticas especiales de acolchado incluyen una mesa ancha desmontable, pie de acolchado de acciÃ³n de resorte y la capacidad de acolchado libre. El HC1850 es liviano y portÃ¡til, y perfecto para llevar a clases.",
  },
  {
    id: 14,
    name: "Brother RLX 3817",
    price: 655000,
    image: "/images/rlx3817.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "Modelo econÃ³mico y funcional para labores bÃ¡sicas de costura. Ideal para quienes necesitan una soluciÃ³n prÃ¡ctica y de bajo costo.",
  },
  {
    id: 15,
    name: "Brother SE 725 Cose & Borda",
    price: 3650000,
    image: "/images/se725.png",
    icon: IconPackage,
    category: "Bordadoras",
    description: "MÃ¡quina combinada que cose y borda, perfecta para emprendedores creativos. Integra funciones de bordado con la versatilidad de una mÃ¡quina de coser domÃ©stica.",
  },
  {
    id: 16,
    name: "Brother VX1445",
    price: 750000,
    image: "/images/vx1445.png",
    icon: IconPackage,
    category: "Maquinas De Coser Brother",
    description: "MÃ¡quina prÃ¡ctica para costuras del hogar con un desempeÃ±o estable. Buena para reparaciones, confecciÃ³n bÃ¡sica y proyectos personales.",
  },
  {
    id: 17,
    name: "Cortadora KS100B inalambrica",
    price: 580000,
    image: "/images/100b.jpg",
    icon: IconPackage,
    category: "Cortadoras De Tela",
    description: "Cortadora inalÃ¡mbrica pensada para comodidad y movilidad en el taller. Corte preciso y diseÃ±o ergonomico para sesiones de trabajo sin cables.",
  },
  {
    id: 18,
    name: "Cortadora KS65 Kansew",
    price: 1000,
    image: "/images/ks65.jpg",
    icon: IconPackage,
    category: "Cortadoras De Tela",
    description: "Cortadora de tela compacta para cortes rÃ¡pidos y eficientes. Ideal para talleres pequeÃ±os y uso domÃ©stico intensivo.",
  },
  {
    id: 19,
    name: "Cortadora Mecatronica 4 Pulgadas",
    price: 500000,
    image: "/images/4p.jpg",
    icon: IconPackage,
    category: "Cortadoras De Tela",
    description: "Cortadora mecatronica de 4\" diseñada para cortes limpios y controlados. Buena opciÃ³n para acabados finos en telas delicadas y trabajos de confecciÃ³n.",
  },
  {
    id: 20,
    name: "Cortadora RC 100 4P",
    price: 1000,
    image: "/images/rc100.jpg",
    icon: IconPackage,
    category: "Cortadoras De Tela",
   description: `
<p>œ‚ï¸ La Cortadora RC-100 es ideal para talleres de confecciÃ³n, sastrerÃ­as y trabajos donde necesitas cortes limpios y precisos. Perfecta si prefieres rapidez y eficiencia en vez de tijeras manuales.</p>

<h4>Especificaciones principales</h4>
<ul>
  <li>Cuchilla de 4 pulgadas (‰ˆ 10 cm), muchas veces de tipo hexagonal u octagonal.</li>
  <li>Capacidad de cortar varias capas de tela (aprox. 5€“40 capas, segÃºn la tela).</li>
  <li>Altura mÃ¡xima de corte: 25 mm en modelos estÃ¡ndar.</li>
  <li>Potencia tÃ­pica: 250 W en versiones de mayor rendimiento.</li>
  <li>Material del cuerpo: acero para mayor durabilidad.</li>
</ul>

<h4>Ventajas</h4>
<ul>
  <li>Corte mucho mÃ¡s rÃ¡pido que con tijeras manuales.</li>
  <li>Mejores acabados en curvas y formas gracias al cuchillo rotatorio.</li>
  <li>Reduce esfuerzo fÃ­sico y evita cortes torcidos o imprecisos.</li>
  <li>VersÃ¡til: telas livianas y medianamente gruesas.</li>
</ul>

<h4>Lo que conviene saber</h4>
<ul>
  <li>En telas muy gruesas la cantidad de capas que puede cortar baja.</li>
  <li>Algunos modelos hacen ruido y vibran, conviene usarla sobre superficie estable.</li>
  <li>MantÃ©n la cuchilla afilada; varios modelos incluyen afilador automÃ¡tico.</li>
  <li>Verifica voltaje y adaptabilidad antes de usar.</li>
</ul>
`,

  },
  {
    id: 21,
    name: "Cortadora RC-70",
    price: 1000,
    image: "/images/rc70.jpg",
    icon: IconPackage,
    category: "Cortadoras De Tela",
    description: "Cortadora versÃ¡til para uso industrial y semiprofesional. FÃ¡cil de operar y mantener, adecuada para cortes de producciÃ³n.",
  },
  {
    id: 22,
    name: "Fileteadora Brother 1034D",
    price: 1580000,
    image: "/images/1034d.jpg",
    icon: IconPackage,
    category: "Fileteadoras Familiares",
    description: "Fileteadora familiar de excelente rendimiento para acabados y remates en telas. Ideal para confecciÃ³n casera con resultados profesionales.",
  },
  {
    id: 23,
    name: "Fileteadora Electronica Jack C4",
    price: 3560000,
    image: "/images/c4.jpg",
    icon: IconPackage,
    category: "Maquinas Electronicas",
    description: "Fileteadora electrÃ³nica con funciones avanzadas para talleres que requieren acabado fino y control en cada puntada. Gran rendimiento en producciÃ³n continua.",
  },
  {
    id: 24,
    name: "Fileteadora Electronica Kansew",
    price: 90000,
    image: "/images/kansewspecial.png",
    icon: IconPackage,
    category: "Maquinas Electronicas",
    description: "Fileteadora electrÃ³nica confiable, recomendada para usuarios que buscan consistencia en acabados. Sencilla de usar y de buen mantenimiento.",
  },
  {
    id: 25,
    name: "Fileteadora Industrial Wilcox",
    price: 1600000,
    image: "/images/wilcox.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Fileteadora de lÃ­nea industrial diseÃ±ada para altos volÃºmenes de trabajo y acabados resistentes. ConstrucciÃ³n sÃ³lida para uso intensivo en talleres.",
  },
  {
    id: 26,
    name: "Fileteadora JACK E4S",
    price: 2600000,
    image: "/images/e4s.jpg",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Fileteadora mecatrÃ³nica de alto rendimiento con funcionamiento silencioso y ajustes precisos. Excelente para acabados profesionales en confecciÃ³n industrial y semifamiliar.",
  },
  {
    id: 27,
    name: "Fileteadora Jack E3",
    price: 2300000,
    image: "/images/e3.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Modelo sÃ³lido y confiable, pensado para obtener remates y fileteados uniformes. Ideal en talleres que combinan producciÃ³n y acabados de alta calidad.",
  },
  {
    id: 28,
    name: "Fileteadora Kansew KS320",
    price: 990000,
    image: "/images/ks320.jpg",
    icon: IconPackage,
    category: "Fileteadoras Familiares",
    description: "Fileteadora domÃ©stica con buen balance entre precio y prestaciones. Apta para usuarios que buscan acabados profesionales en casa o pequeÃ±os emprendimientos.",
  },
  {
    id: 29,
    name: "Fileteadora Kansew Original",
    price: 1780000,
    image: "images/kanseworiginal.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Fileteadora original de marca reconocida, con durabilidad y desempeÃ±o para talleres. Ofrece acabados consistentes y facilidad de mantenimiento.",
  },
  {
    id: 30,
    name: "Fileteadora Kingter",
    price: 1700000,
    image: "/images/kingter.png",
    icon: IconPackage,
    category: "Maquinas Electronicas",
    description: "Fileteadora de buena relaciÃ³n calidad-precio, pensada para producciÃ³n ligera y acabados profesionales. FÃ¡cil de ajustar y mantener.",
  },
  {
    id: 31,
    name: "Fileteadora Kingter Panel Integrado",
    price: 1750000,
    image: "/images/kingterpanel.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "VersiÃ³n de Kingter con panel integrado para control mÃ¡s cÃ³modo y preciso. Recomendado para talleres que requieren ajustes rÃ¡pidos y versÃ¡tiles.",
  },
  {
    id: 32,
    name: "Fileteadora KS504",
    price: 700000,
    image: "images/ks504.png",
    icon: IconPackage,
    category: "Fileteadoras Familiares",
    description: "Fileteadora familiar econÃ³mica y funcional. Buena opciÃ³n para quienes empiezan un emprendimiento o necesitan una herramienta fiable en casa.",
  },
  {
    id: 33,
    name: "Fileteadora Mecatronica Gensy",
    price: 1480000,
    image: "/images/gensy.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Fileteadora mecatrÃ³nica con controles modernos y rendimiento estable. DiseÃ±ada para ofrecer acabados uniformes en producciÃ³n media.",
  },
  {
    id: 34,
    name: "Fileteadora Mecatronica Zoje",
    price: 2300000,
    image: "/images/zoje.png",
    icon: IconPackage,
    category: "Fileteadoras Mecatronicas",
    description: "Fileteadora de marca reconocida en el sector, con construccion robusta y rendimiento indicado para talleres con ritmo de trabajo intenso.",
  },
  {
    id: 35,
    name: "Fileteadora S0105",
    price: 1500000,
    image: "/images/s0105.jpg",
    icon: IconPackage,
    category: "Fileteadoras Familiares",
    description: "Modelo familiar que combina facilidad de uso y buenos acabados en todo tipo de tela. Ideal para uso domestico y pequeños emprendimientos.",
  },
  {
    id: 36,
    name: "Fileteadora Singer Heavy Duty HD0405S",
    price: 1650000,
    image: "/images/hd045s1.png",
    icon: IconPackage,
    category: "Fileteadoras Familiares",
    description: "Fileteadora Singer pensada para alto desempeÃ±o en el hogar y estudio. Confiable, resistente y con acabados de calidad profesional.",
  },
  {
    id: 37,
    name: "Jack A2B",
    price: 12,
    image: "/images/a2b.jpg",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana mecÃ¡nica bÃ¡sica y eficiente para costura recta. Adecuada para confecciÃ³n general y uso semiprofesional.",
  },
  {
    id: 38,
    name: "Jack C7 IA Fileteadora",
    price: 3900000,
    image: "/images/c7.jpg",
    icon: IconPackage,
    category: "Maquinas Electronicas",
    description: "Fileteadora electronica de alta gama con funciones inteligentes y rendimiento industrial. Ideal para talleres que buscan automatizaciÃ³n y precisiÃ³n.",
  },
  {
    id: 39,
    name: "Lampara 3 Niveles de Luz",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "LÃ¡mpara con tres intensidades para ajustar la iluminaciÃ³n segÃºn la tarea. Perfecta para detalles finos en costura y bordado.",
  },
  {
    id: 40,
    name: "Lampara Circular con Interruptor",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "LÃ¡mpara circular compacta con interruptor integrado. Proporciona luz uniforme y enfocada para el puesto de trabajo.",
  },
  {
    id: 41,
    name: "Lampara en Herradura",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "LÃ¡mpara con forma de herradura que ofrece iluminaciÃ³n amplia y constante. Ideal para mesas de trabajo y costura industrial.",
  },
  {
    id: 42,
    name: "Lampara Flexible",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "Lampara con brazo flexible para dirigir la luz exactamente donde se necesita. Muy Ãºtil en trabajos de detalle y reparaciÃ³n.",
  },
  {
    id: 43,
    name: "Lampara Imantada",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "Lampara con base imantada para fijarla en superficies metÃ¡licas. PrÃ¡ctica y portÃ¡til para el taller o la mesa domÃ©stica.",
  },
  {
    id: 44,
    name: "Lampara Industrial",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "Lampara robusta para uso intensivo en talleres industriales. DiseÃ±ada para ofrecer luz potente y duradera durante jornadas largas.",
  },
  {
    id: 45,
    name: "Lampara Portacono",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Lamparas",
    description: "LÃ¡mpara especializada para trabajos con conos y soportes; facilita la iluminaciÃ³n cerca del Ã¡rea de costura y devanado.",
  },
  {
    id: 46,
    name: "Maquina 20u Jack semi industrial",
    price: 2300000,
    image: "",
    icon: IconPackage,
    category: "Maquinas 20u",
    description: "MÃ¡quina 20u semi-industrial Jack, equilibrio entre potencia y tamaÃ±o compacto. Ideal para talleres con necesidad de producciÃ³n constante sin sacrificar espacio.",
  },
  {
    id: 47,
    name: "Maquina KIngter 20u",
    price: 2180000,
    image: "",
    icon: IconPackage,
    category: "Maquinas 20u",
    description: "MÃ¡quina 20u Kingter diseÃ±ada para durabilidad y rendimiento en tareas de producciÃ³n. Buena para confecciones en cadena y remates precisos.",
  },
  {
    id: 48,
    name: "Maquina 20u Kansew",
    price: 2050000,
    image: "",
    icon: IconPackage,
    category: "Maquinas 20u",
    description: "MÃ¡quina 20u de marca Kansew, pensada para productividad y uso continuado. Confiable en entornos de producciÃ³n y talleres grandes.",
  },
  {
    id: 49,
    name: "Maquina de Coser Juki",
    price: 729000,
    image: "/images/juki.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Juki, reconocida por su robustez y durabilidad; mÃ¡quina de alto rendimiento indicada para confecciÃ³n profesional. Excelente para trabajos continuos y pesados.",
  },
  {
    id: 50,
    name: "Maquina dos agujas doble transporte",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "MÃ¡quina de doble aguja y doble transporte para costuras reforzadas y puntadas resistentes en tejidos pesados. Ideal para jean, cuero sintÃ©tico y tapicerÃ­a ligera.",
  },
  {
    id: 51,
    name: "Maquina dos agujas triple transporte mecatronica",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Equipo de triple transporte con dos agujas, diseÃ±ado para mÃ¡xima tracciÃ³n y acabados perfectos en materiales difÃ­ciles. Recomendado para producciÃ³n industrial.",
  },
  {
    id: 52,
    name: "Maquina plana mecanica doble transporte",
    price: 1880000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Plana mecÃ¡nica con doble transporte que garantiza una alimentaciÃ³n uniforme en telas gruesas. Ideal para quienes requieren costuras fuertes y precisas en producciÃ³n pesada.",
  },
  {
    id: 53,
    name: "Maquina triple transporte Typical REF gc6-7d",
    price: 3200000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "MÃ¡quina triple transporte Typical, diseÃ±ada para acabados industriales y costuras en materiales de alto gramaje. Excelente rendimiento en producciÃ³n exigente.",
  },
  {
    id: 54,
    name: "Plana Kingter KTD3",
    price: 1450000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana mecÃ¡nica Kingter de buena construcciÃ³n, pensada para uso semiindustrial. Proporciona estabilidad y acabados profesionales en costura recta.",
  },
  {
    id: 55,
    name: "Plana Mecatronica Kansew Original",
    price: 1480000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana mecatrÃ³nica de Kansew con diseÃ±o robusto y caracterÃ­sticas orientadas a productividad. Ideal para talleres que necesitan velocidad y precisiÃ³n.",
  },
  {
    id: 56,
    name: "Plana Mecatronica Original JACK F5",
    price: 1750000,
    image: "/images/planamecatronicaoriginaljackf5.jpg",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana JACK F5: alta velocidad, motor silencioso direct-drive y posicionador de aguja. DiseÃ±ada para trabajo diario (7€“8h) en confecciÃ³n de prendas desde telas livianas hasta medianas y semipesadas; se entrega calibrada segÃºn el tipo de trabajo.",
  },
  {
    id: 57,
    name: "Plana Mecatronica Sewking",
    price: 1350000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana mecÃ¡nica de buen desempeÃ±o para talleres medianos. Ofrece equilibrio entre potencia, durabilidad y precio accesible.",
  },
  {
    id: 58,
    name: "Plana Siruba Original mecÃ¡nica",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana Siruba original, reconocida por su robustez y desempeÃ±o en costura continua. Recomendable para producciÃ³n y talleres que requieren fiabilidad.",
  },
  {
    id: 58.1,
    name: "Plana Wilcox Industrial Incluye Mueble",
    price: 1380000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana Wilcox industrial que incluye mueble, pensada para uso intensivo. Ideal para lÃ­neas de producciÃ³n que necesitan equipo estable y confortable para el operario.",
  },
  {
    id: 59,
    name: "Plana Industrial Wilcox",
    price: 1350000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana industrial Wilcox: rendimiento y durabilidad para talleres con carga de trabajo continua. DiseÃ±o pensado para productividad y mantenimiento sencillo.",
  },
  {
    id: 60,
    name: "Plana doble transporte Typical",
    price: 1980000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Plana doble transporte Typical para costuras reforzadas y alimentaciÃ³n precisa de tela. Recomendable para confecciÃ³n de prendas pesadas y lÃ­neas industriales.",
  },
  {
    id: 61,
    name: "Plana Triple Transporte Wilcox",
    price: 3150000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Plana de triple transporte Wilcox, diseÃ±ada para asegurar mÃ¡xima tracciÃ³n y acabado Ã³ptimo en materiales de alto gramaje. Excelente para producciÃ³n industrial especializada.",
  },
  {
    id: 62,
    name: "Plana Electronica Jack A4B",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planas Electronicas",
    description: "Plana electrÃ³nica Jack A4B con controles precisos y funcionalidades que facilitan la producciÃ³n. Buen equilibrio entre tecnologÃ­a y coste.",
  },
  {
    id: 63,
    name: "Plana Electronica Jack A5E",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planas Electronicas",
    description: "Plana electrÃ³nica Jack A5E, adecuada para quienes buscan automatizaciÃ³n y control en acabados. Sencilla de operar y mantener.",
  },
  {
    id: 64,
    name: "Plana Electronica Kansew",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planas Electronicas",
    description: "Plana electrÃ³nica Kansew: precisiÃ³n y fiabilidad en entornos de trabajo continuo. Pensada para talleres que desean un salto tecnolÃ³gico en sus equipos.",
  },
  {
    id: 65,
    name: "Plancha Generica",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planchas",
    description: "Plancha genÃ©rica de uso domÃ©stico y taller. Sencilla, funcional y apta para arreglos rÃ¡pidos y planchado cotidiano.",
  },
  {
    id: 66,
    name: "Plancha Original Jack",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planchas",
    description: "Plancha oficial Jack, diseÃ±ada para uso en talleres y confecciÃ³n. Ofrece buena durabilidad y temperatura constante para telas diversas.",
  },
  {
    id: 67,
    name: "Plancha Original Silver Start 85f",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Planchas",
    description: "Plancha Silver Start 85f: rendimiento confiable y acabados profesionales. Ideal para centros de planchado y talleres de confecciÃ³n.",
  },
  {
    id: 68,
    name: "Plana Promise 1412 (Singer Promise 1412)",
    price: 90000,
    image: "/images/singerpromise1412.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer Promise 1412: mÃ¡quina domÃ©stica fÃ¡cil de usar, perfecta para principiantes y tareas cotidianas. Ligera, prÃ¡ctica y con puntadas bÃ¡sicas para proyectos del hogar.",
  },
  {
    id: 69,
    name: "Ribeteadora incluye mueble",
    price: 2980000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Ribeteadora profesional que incluye mueble para mayor comodidad y estabilidad. Ideal para acabados de esquinados y remates en producciÃ³n industrial.",
  },
  {
    id: 70,
    name: "Soplador",
    price: 135000,
    image: "",
    icon: IconPackage,
    category: "Accesorios Extras",
    description: "Soplador compacto para limpieza y mantenimiento del puesto de trabajo. Ãštil para eliminar hilachas y polvo en Ã¡reas de costura y mÃ¡quinas.",
  },
  {
    id: 71,
    name: "Singer 2273",
    price: 950000,
    image: "/images/2273.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer 2273: mÃ¡quina prÃ¡ctica y versÃ¡til con una buena selecciÃ³n de puntadas. Ideal para proyectos de hogar y usuarios que buscan fiabilidad.",
  },
  {
    id: 72,
    name: "Singer 2505",
    price: 787000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Modelo compacto y confiable para uso domÃ©stico. Perfecta para reparaciones, dobladillos y labores cotidianas de costura.",
  },
  {
    id: 73,
    name: "Singer 4432",
    price: 1380000,
    image: "/images/singer4432.jpg",
    icon: IconScissors,
    category: "Maquinas De Coser Singer",
    description: "Singer Heavy Duty 4432: mÃ¡quina robusta y de alto rendimiento con 32 puntadas y motor potente. Ideal para telas gruesas y proyectos exigentes.",
  },
  {
    id: 74,
    name: "Singer 4432 Color Negro",
    price: 90000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "VersiÃ³n en color negro de la famosa Singer 4432, con la misma potencia y confiabilidad. Perfecta para usuarios que buscan estilo y rendimiento.",
  },
  {
    id: 75,
    name: "Singer 4423 HEAVY DUTY",
    price: 1250000,
    image: "/images/4423.jpg",
    icon: IconWrench,
    category: "Maquinas De Coser Singer",
    description: "Singer 4423 Heavy Duty: mÃ¡quina potente y resistente con hasta 1.100 puntadas/min y motor reforzado. Recomendada para trabajos exigentes y telas pesadas.",
  },
  {
    id: 76,
    name: "Singer 6605C",
    price: 1550000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer 6605C: mÃ¡quina electrÃ³nica con mÃºltiples funciones y acabados profesionales. Buena para usuarios que desean versatilidad y potencia.",
  },
  {
    id: 77,
    name: "Singer HD6705C",
    price: 122121,
    image: "/images/HD6705C.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer HD6705C: estilo heavy duty con prestaciones para uso regular y proyectos que requieren mayor resistencia. Buena relaciÃ³n calidad-precio.",
  },
  {
    id: 78,
    name: "Singer HD6705C Heavy Duty",
    price: 1650000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "VersiÃ³n Heavy Duty del HD6705C: mayor potencia y durabilidad para trabajos mÃ¡s pesados. Recomendada para talleres y uso intensivo.",
  },
  {
    id: 79,
    name: "Singer M 1255",
    price: 790000,
    image: "/images/1255.png",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer M1255: mÃ¡quina prÃ¡ctica con funciones bÃ¡sicas y rendimiento confiable para el hogar. FÃ¡cil de usar y mantener.",
  },
  {
    id: 80,
    name: "Singer M3220",
    price: 900000,
    image: "/images/M3220.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer M3220, diseÃ±ada para ofrecer resultados robustos y versÃ¡tiles en tareas de costura domÃ©stica. Ideal para aficionados que buscan durabilidad.",
  },
  {
    id: 81,
    name: "Singer M3305",
    price: 899000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer M3305: modelo equilibrado para proyectos domÃ©sticos y creativos. Buen conjunto de funciones para principiantes y usuarios intermedios.",
  },
  {
    id: 82,
    name: "Singer Promise 1412 (alternate)",
    price: 90000,
    image: "/images/singerpromise1412.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Otra listing de la Singer Promise 1412; versiÃ³n prÃ¡ctica y econÃ³mica para uso domÃ©stico. Ideal como primera mÃ¡quina de coser.",
  },
  {
    id: 83,
    name: "Singer Simple 2663",
    price: 75000,
    image: "/images/simple2663.jpg",
    icon: IconNeedle,
    category: "Maquinas De Coser Singer",
    description: "Singer Simple 2663: mÃ¡quina fÃ¡cil de usar con enhebrador automÃ¡tico y variedad de puntadas. Ideal para aprender y para proyectos rÃ¡pidos en casa.",
  },
  {
    id: 84,
    name: "Singer Simple 3221",
    price: 950000,
    image: "/images/3221.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer Simple 3221, diseÃ±ada para principiantes que buscan funciones Ãºtiles y buena confiabilidad en proyectos domÃ©sticos.",
  },
  {
    id: 85,
    name: "Singer Start 1306",
    price: 700000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Singer Start 1306: modelo compacto y accesible para iniciarse en costura. Ligera y prÃ¡ctica para remedios y manualidades en casa.",
  },
  {
    id: 86,
    name: "SINGER 2273 (duplicate cleaned)",
    price: 950000,
    image: "/images/2273.jpg",
    icon: IconPackage,
    category: "Maquinas De Coser Singer",
    description: "Listado complementario de Singer 2273; mÃ¡quina equilibrada para tareas domÃ©sticas y proyectos creativos.",
  },
  {
    id: 87,
    name: "Plana Kingter KTD3 (duplicate cleaned)",
    price: 1450000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana Kingter KTD3, equipo confiable para trabajo diario y producciones pequeÃ±as. Buena relaciÃ³n precio-calidad.",
  },
  {
    id: 88,
    name: "Cortadora Vertical 8 Pulgadas",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Cortadora Vertical",
    description: "Cortadora vertical de 8\" adecuada para cortar rollos y piezas en taller. DiseÃ±o para cortes precisos y repetitivos.",
  },
  {
    id: 89,
    name: "Cortadora Vertical Easyman",
    price: 1000,
    image: "",
    icon: IconPackage,
    category: "Cortadora Vertical",
    description: "Cortadora vertical Easyman pensada para operatividad sencilla y cortes regulares en producciÃ³n pequeÃ±a. FÃ¡cil manejo y mantenimiento.",
  },
  {
    id: 90,
    name: "Collarin Industrial Kansew",
    price: 2550000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "CollarÃ­n industrial Kansew para tareas intensas de montaje y remates. Calidad de construcciÃ³n para uso continuo en talleres.",
  },
  {
    id: 91,
    name: "Collarin Industrial Kingter",
    price: 2380000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "CollarÃ­n Kingter industrial, resistente y pensado para lÃ­neas de producciÃ³n. Aporta estabilidad y acabados profesionales.",
  },
  {
    id: 92,
    name: "Collarin Industrial Wilcox",
    price: 2300000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "CollarÃ­n Wilcox de alto desempeÃ±o, ideal para ensambles y trabajos que requieren rapidez y precisiÃ³n en remates.",
  },
  {
    id: 93,
    name: "Collarin Jack W4",
    price: 3180000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "CollarÃ­n Jack W4: equipo premium diseÃ±ado para alta productividad. Recomendado para talleres profesionales con demanda constante.",
  },
  {
    id: 94,
    name: "Collarin Kingter panel integrado",
    price: 2550000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "VersiÃ³n de collarÃ­n Kingter con panel integrado para mayor control y ajustes rÃ¡pidos. Perfecto para producciÃ³n optimizada.",
  },
  {
    id: 95,
    name: "Collarin typical original",
    price: 2380000,
    image: "",
    icon: IconPackage,
    category: "Collarin Industrial",
    description: "CollarÃ­n Typical original, confiable y duradero. Ideal para terminar prendas con remates consistentes.",
  },
  {
    id: 96,
    name: "Fileteadora Electronica C4 (duplicate cleaned)",
    price: 3560000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Maquinas Electronicas",
    description: "Fileteadora electrÃ³nica C4, potente y pensada para acabados de alta calidad en producciÃ³n.",
  },
  {
    id: 97,
    name: "Maquina KIngter 20u (duplicate cleaned)",
    price: 2180000,
    image: "",
    icon: IconPackage,
    category: "Maquinas 20u",
    description: "MÃ¡quina Kingter 20u, diseÃ±ada para productividad y durabilidad en lÃ­neas de confecciÃ³n.",
  },
  {
    id: 98,
    name: "Plana Mecatronica Sewking (duplicate cleaned)",
    price: 1350000,
    image: "https://images.unsplash.com/photo-1616628182502-92e7bb8e4632?q=80&w=1200&auto=format&fit=crop",
    icon: IconPackage,
    category: "Planas Mecatronicas",
    description: "Plana Sewking: buen desempeÃ±o en producciÃ³n ligera y semiprofesional.",
  },
  {
    id: 99,
    name: "Maquina triple transporte Typical REF gc6-7d (duplicate cleaned)",
    price: 3200000,
    image: "",
    icon: IconPackage,
    category: "Maquinas Para Trabajo Pesado",
    description: "Maquina Typical de triple transporte, orientada a producciÃ³n pesada y telas difÃ­ciles. PrecisiÃ³n y robustez para trabajo continuo.",
  },

];
// Normalize accent issues in data once at load
try {
  if (STATIC_STORE) {
    if (STATIC_STORE.name) STATIC_STORE.name = fixCopy(normalizeText(STATIC_STORE.name));
    if (STATIC_STORE.address) STATIC_STORE.address = fixCopy(normalizeText(STATIC_STORE.address));
    if (STATIC_STORE.email) STATIC_STORE.email = fixCopy(normalizeText(STATIC_STORE.email));
  }
  if (Array.isArray(FALLBACK_CATEGORIES)) {
    FALLBACK_CATEGORIES.forEach((category) => {
      if (category && category.name) {
        category.name = fixCopy(normalizeText(category.name));
      }
    });
  }
  if (Array.isArray(STATIC_PRODUCTS)) {
    STATIC_PRODUCTS.forEach((product) => {
      if (!product) return;
      if (product.name) product.name = fixCopy(normalizeText(product.name));
      if (product.description) product.description = fixCopy(normalizeText(product.description));
      if (product.category) product.category = fixCopy(normalizeText(product.category));
    });
  }
} catch {}
const formatCOP = (v) => {
  try {
    return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  } catch {
    return `COP ${v}`;
  }
};

function ExpandableText({ text, maxLength = 90 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return (
      <div
        className="mt-2 text-sm text-gray-600"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className="mt-2 text-sm text-gray-600"
        dangerouslySetInnerHTML={{
          __html: isExpanded ? text : text.substring(0, maxLength) + "..."
        }}
      />
      <button
        onClick={toggleReadMore}
        className="text-green-700 text-sm font-semibold mt-1 hover:underline"
      >
        {isExpanded ? "Leer menos" : "Leer mas..."}
      </button>
    </div>
  );
}

// Barra de búsqueda reutilizable
function SearchBar({ value, onChange, placeholder = "Buscar productos..." }) {
  const hasValue = Boolean((value || '').trim());
  return (
    <div className="relative w-[90%] mx-auto max-w-lg md:max-w-xl">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-800/70">
        <IconSearch className="h-4 w-4 md:h-5 md:w-5" />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 md:h-11 lg:h-12 rounded-lg border border-white/70 bg-white/85 backdrop-blur-sm shadow-md shadow-black/5 ring-1 ring-black/5 hover:ring-black/10 focus:ring-2 focus:ring-green-300/40 focus:border-white/70 px-3 py-2 pl-9 pr-10 text-sm md:text-base outline-none placeholder:text-gray-500"
      />
      {hasValue ? (
        <button
          type="button"
          aria-label="Limpiar"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 p-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <IconClose className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      ) : null}
      <span className="hidden">
        A??,?????
      </span>
    </div>
  );
}

// Barra sticky

// Barra sticky que se mantiene visible y centra el buscador
function StickySearch({ products = [], value, onChange, onAddToCart, onBuyNow, categories = [] }) {
  const location = useLocation();
  const match = location.pathname.match(/^\/c\/([^/]+)/);
  const activeSlug = match ? match[1] : null;
  const scopeName = activeSlug ? (categories.find(c => slugify(c.name) === activeSlug)?.name || "esta categoria") : "todo el catalogo";
  const list = activeSlug ? products.filter(p => slugify(p.category) === activeSlug) : products;
  const q = (value || "").trim().toLowerCase();
  const results = q ? list.filter(p => (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))).slice(0, 10) : [];

  return (
    <>
      {/* Sticky search bar pinned near the top-right */}
      <div className="sticky top-2 z-50 mt-4 w-[90%] mx-auto max-w-lg md:max-w-xl min-w-[12rem] lg:mx-0 lg:ml-auto lg:mr-4">
        {/* Results are absolutely positioned so they overlay the page instead of pushing layout */}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-800/70">
            <IconSearch className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Buscar en ${scopeName}...`}
            className="w-full h-10 md:h-11 lg:h-12 rounded-lg border border-white/70 bg-white/85 backdrop-blur-sm shadow-md shadow-black/5 ring-1 ring-black/5 hover:ring-black/10 focus:ring-2 focus:ring-green-300/40 focus:border-white/70 px-3 py-2 pl-9 pr-10 text-sm md:text-base outline-none placeholder:text-gray-500"
          />
          {(value || "").trim() ? (
            <button
              type="button"
              aria-label="Limpiar"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 p-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <IconClose className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-800/60">
              <IconSearch className="h-4 w-4 md:h-5 md:w-5" />
            </span>
          )}

          {q && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-auto rounded-2xl border border-green-100 bg-white/95 backdrop-blur-md shadow-xl z-50">
              {results.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">Sin resultados</div>
              ) : (
                results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${getProductSlug(p)}`}
                    onClick={() => onChange('')}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-green-50/80"
                  >
                    <img src={p.image || "/images/default.png"} alt="thumb" className="h-8 w-8 rounded object-contain bg-gray-50 border" />
                    <div className="min-w-0">
                      <div className="text-sm text-green-800 truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{p.category}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CategoryStrip({ products = [], title, subtitle = "Top picks de la categor?a", store = STATIC_STORE }) {
  const slug = slugify(title);
  const list = products.filter(p => slugify(p.category) === slug).slice(0, 10);
  if (list.length === 0) return null;

  const whatsappLink = (store?.whatsapp || STATIC_STORE.whatsapp || "").trim();

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h3 className="text-lg font-extrabold text-green-800">{title}</h3>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
        <Link to={`/c/${slug}`} className="text-green-700 text-sm hover:underline">Ver todo ?????T</Link>
      </div>

      {/* Carrusel horizontal en mA3vil */}
      <HSlider>
        {list.map((p) => (
          <div
            key={p.id}
            className="min-w-[200px] max-w-[210px] sm:min-w-[240px] sm:max-w-[260px] snap-start bg-white rounded-xl shadow-lg border border-gray-100 p-4 transform transition-transform duration-200 ease-out md:hover:scale-105"
          >
            <div className="relative w-full aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden shadow-sm flex items-center justify-center group">
              <img src={p.image || "/images/default.png"} alt={p.name} className="object-contain w-full h-full" />
              <Link
                to={`/product/${getProductSlug(p)}`}
                className="absolute inset-0 focus:outline-none"
                aria-label={`Ver mas de ${p.name}`}
              >
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />
                <span className="absolute bottom-2 right-2 bg-white/90 text-green-800 text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Ver mas
                </span>
              </Link>
            </div>

            <div className="mt-2">
              <h4 className="font-bold text-lg truncate">{p.name}</h4>
              <div className="text-green-700 font-extrabold text-xl mt-1">{formatCOP(p.price)}</div>
              <p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">{p.description}</p>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                to={`/c/${slug}`}
                className="flex-1 text-center bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:shadow-lg transform hover:-translate-y-[2px]"
              >
                Ver categorA-a
              </Link>
              {whatsappLink && (
                <a
                  className="px-3 py-2 rounded-lg border border-green-200 text-green-700 text-sm"
                  href={`${whatsappLink}?text=${encodeURIComponent(`Hola, me interesa ${p.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar
                </a>
              )}
            </div>
          </div>
        ))}
      </HSlider>
    </section>
  );
}


function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (snapshot) => {
        const incoming = snapshot.docs
          .map((document) => mapProductDocument(document))
          .filter(Boolean)
          .filter((product) => Boolean(product?.bestSeller));

        setBestSellers(incoming);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load best sellers", error);
        setBestSellers([]);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  if (!bestSellers.length && loading) {
    return null;
  }

  const normalizedList = bestSellers
    .map((item) => {
      const imageCandidates = Array.isArray(item.images) ? item.images : [];
      const firstImage = imageCandidates.find((src) => typeof src === "string" && src.trim() !== "") || "";
      const fallbackImage =
        (typeof item.image === "string" && item.image.trim()) ||
        (typeof item.imageUrl === "string" && item.imageUrl.trim()) ||
        "";

      return {
        ...item,
        coverImage: firstImage || fallbackImage || "/images/default.png",
      };
    })
    .filter((item) => Boolean(item?.id));

  if (!normalizedList.length) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-2">
        <h3 className="text-lg font-extrabold text-green-800">Las mas vendidas</h3>
        <span className="text-xs font-semibold text-gray-600">Elegidas por nuestros clientes</span>
      </div>

      <HSlider>
        {normalizedList.map((product) => (
          <Link
            key={product.id}
            to={`/product/${getProductSlug(product)}`}
            className="min-w-[200px] max-w-[210px] sm:min-w-[240px] sm:max-w-[260px] snap-start bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:shadow-xl"
            aria-label={`Ver m�s de ${product.name}`}
          >
            <div className="relative w-full aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden shadow-sm flex items-center justify-center">
              <img src={product.coverImage} alt={product.name} className="object-contain w-full h-full" loading="lazy" />
            </div>

            <div className="mt-2">
              <h4 className="font-bold text-lg text-green-800 truncate">{product.name}</h4>
              <div className="text-green-700 font-extrabold text-xl">{formatCOP(product.price)}</div>
            </div>
          </Link>
        ))}
      </HSlider>
    </section>
  );
}
/* ------------------------- App (updated sizing & spacing) ------------------------- */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notification, setNotification] = useState("");
  const [productsState, setProductsState] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [socialState, setSocialState] = useState(SOCIAL_DEFAULTS);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialError, setSocialError] = useState("");

  const [categoryDocs, setCategoryDocs] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [authUser, authLoading] = useAuthState(auth);

  useEffect(() => {
    setSocialLoading(true);
    const unsubscribe = subscribeToSocial(
      (snapshot) => {
        const data = mapSocialDocument(snapshot);
        setSocialState(data);
        setSocialLoading(false);
        setSocialError("");
      },
      (error) => {
        console.error("[App] Failed to load social data", error);
        setSocialState(SOCIAL_DEFAULTS);
        setSocialLoading(false);
        setSocialError("No pudimos cargar la informaci?n social.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setCategoriesLoading(true);
    const unsubscribe = subscribeToCategories(
      (snapshot) => {
        const docs = snapshot.docs
          .map((document) => mapCategoryDocument(document))
          .filter(Boolean)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCategoryDocs(docs);
        setCategoriesLoading(false);
        setCategoriesError("");
      },
      (error) => {
        console.error("[App] Failed to load categories", error);
        setCategoriesLoading(false);
        setCategoriesError("No pudimos cargar las categor?as.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setProductsLoading(true);

    const unsubscribe = subscribeToProducts(
      (snapshot) => {
        const nextProducts = snapshot.docs
          .map((document) => mapProductDocument(document))
          .filter(Boolean)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setProductsState(nextProducts);
        setProductsError("");
        setProductsLoading(false);
      },
      (error) => {
        console.error("Failed to load products", error);
        setProductsError("No pudimos cargar los productos. Intenta nuevamente.");
        setProductsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const productsList = productsState;

  const categories = useMemo(() => {
    if (categoryDocs.length > 0) {
      return categoryDocs
        .map((category) => {
          const name = typeof category?.name === "string" ? category.name.trim() : "";
          if (!name) {
            return null;
          }
          const Icon = getCategoryIcon(category.icon);
          return {
            name,
            icon: Icon,
          };
        })
        .filter(Boolean);
    }
    return FALLBACK_CATEGORIES;
  }, [categoryDocs]);

  const store = useMemo(() => ({
    ...STATIC_STORE,
    social: {
      ...STATIC_STORE.social,
      ...socialState,
    },
  }), [socialState]);



  const showNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [...prev, { ...product, qty: 1 }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      return next;
    });
    showNotification(`${product.name} agregado al carrito`);
    setNotification("✅ Product added to cart 🛒");
  };

  const handleBuyNow = (product) => {
    let productIsInCart = false;
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        productIsInCart = true;
        return prev;
      }
      productIsInCart = false;
      return [...prev, { ...product, qty: 1 }];
    });

    if (!productIsInCart) {
      showNotification(`${product.name} agregado al carrito`);
      
      setNotification("✅ Product added to cart 🛒");
    }
    setCheckoutOpen(true);
  };

  const increaseQty = (id) => setCart((prev) => prev.map(p => p.id === id ? { ...p, qty: p.qty + 1 } : p));
  const decreaseQty = (id) => setCart((prev) => prev.flatMap(p => p.id === id ? (p.qty > 1 ? [{ ...p, qty: p.qty - 1 }] : []) : [p]));
  const removeItem = (id) => setCart((prev) => prev.filter(p => p.id !== id));
  const clearCart = () => setCart([]);

  const visibleProducts = useMemo(() => {
    return productsList.filter(p => (filter === "All" || p.category === filter) && (!query || p.name.toLowerCase().includes(query.toLowerCase())));
  }, [filter, query, productsList]);

  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = subtotal > 0 && subtotal < 300000 ? 12000 : 0;
  const total = subtotal + shipping;

  const whatsappMessage = () => {
    if (!cart.length) return "Quiero hacer un pedido (carrito vaci­o).";
    const lines = cart.map(c => ` ${c.name} x${c.qty} ” ${formatCOP(c.price * c.qty)}`);
    const msg = [` *Nuevo pedido* €” ${store.name}`, "", ...lines, "", `Subtotal: ${formatCOP(subtotal)}`, `Envio: ${shipping===0?"Gratis":formatCOP(shipping)}`, `Total: ${formatCOP(total)}`, "", `Direccion: (escribe tu direccion)`, ` Telefono: (tu telefono)`, `Email: (tu email)`].join("\n");
   return msg;
  };

return (
  <BrowserRouter>
    <Helmet>
      <title>Senalmaq | Máquinas de coser e insumos textiles</title>
      <meta name="description" content="Compra máquinas de coser, fileteadoras, bordadoras y accesorios con envío rápido y garantía." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:type" content="website" />
    </Helmet>
    
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-900 text-sm">
      {/* Header (logo †’ Home) */}
      <motion.header
        className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow h-14 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <div className="w-full px-4 flex items-center justify-between relative">
          {/* Centered logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Ir a Inicio">
            <img
              src="/images/logosenalmaq.png"
              alt="Senalmaq Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full ring-1 ring-white/50 shadow bg-white/10 p-0.5"
            />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir Categorías"
              className="mr-2 inline-flex items-center gap-2 rounded-md p-2 text-white font-bold hover:bg-white/10"
            >
              <IconMenu className="h-6 w-6 text-white" />
              <span className="hidden md:inline text-lg">Categorías</span>
            </button>

            {/* Haz clic en el logo/nombre para ir a Inicio */}
            <Link to="/" className="hidden">
              <img src="/images/logosenalmaq.png" alt="Senalmaq Logo"
                   className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-md bg-white/10 p-1" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold truncate">{store.name}</h1>
                <p className="text-xs opacity-90">Máquinas, repuestos y suministros • Envíos en Colombia</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCheckoutOpen(true)} className="relative bg-white/10 hover:bg-white/20 rounded-full p-2" aria-label="Abrir carrito">
              <IconShoppingCart className="h-5 w-5 text-white" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {cart.reduce((s,p)=>s+p.qty,0)}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Contacto móvil */}
        <div className="hidden w-full px-3 mt-2 text-[11px] leading-tight space-y-1">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
            <span className="opacity-90">{store.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 opacity-90">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.18 2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.72c.12.86.32 1.7.6 2.5a2 2 0 0 1-.45 2.11l-1 1a16 16 0 0 0 6 6l1-1a2 2 0 0 1 2.11-.45c.8.28 1.64.48 2.5.6A2 2 0 0 1 22 16.92z"/></svg>
              <a href={`tel:${store.phone}`} className="underline">{store.phone}</a>
            </span>
            <span className="inline-flex items-center gap-1 opacity-90">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              <a href={`mailto:${(store.email || '').trim()}`} className="underline">{(store.email || '').trim()}</a>
            </span>
          </div>
        </div>
      </motion.header>

      {/* Buscador sticky global */}
      <StickySearch products={productsList} value={searchQuery} onChange={setSearchQuery} onAddToCart={addToCart} onBuyNow={handleBuyNow} categories={categories} />

      

      {/* Contenedor con sidebar + páginas */}
      <section className="w-full px-0 md:px-0 pt-6 pb-0 flex-1">
        {/* Sidebar (desktop) †’ LINKS, no botones */}
        <aside className="hidden">
          <div className="sticky top-24 bg-white rounded-none shadow-md p-3 max-h-screen md:max-h-[calc(100vh-6rem)] overflow-y-auto scroll-smooth border-r border-green-100"
               style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
            <div className="hidden md:flex items-center gap-2 mb-2 text-green-800">
              <IconMenu className="h-5 w-5" />
              <span className="font-bold">
                {categoriesLoading ? "Cargando categor?as..." : "Categor?as"}
              </span>
            </div>
            {categoriesError && (
              <p className="mb-2 text-xs font-semibold text-red-600">{categoriesError}</p>
            )}
            <h4 className="font-bold text-green-800 mb-2">Categor?as</h4>
            <div className="grid gap-2">
              <Link to="/" className="block w-full p-3 rounded-xl bg-white shadow-md font-bold text-base text-center text-green-800 transition duration-300 transform hover:scale-105 hover:shadow-lg">
                <span className="mr-2" aria-hidden="true">🏠</span> Inicio
              </Link>
              {categories.map(c => (
                <Link
                  key={c.name}
                  to={`/c/${slugify(c.name)}`}
                  className="block w-full p-3 rounded-xl bg-white shadow-md font-bold text-base text-center text-green-800 transition duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="whitespace-nowrap">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Ãrea de páginas (derecha) */}
        <div className="overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home products={productsList} loading={productsLoading} error={productsError} onAddToCart={addToCart} onBuyNow={handleBuyNow} store={store} categories={categories} socialError={socialError} socialLoading={socialLoading} />} />
            <Route path="/c/:slug" element={<CategoryPage products={productsList} loading={productsLoading} error={productsError} onAddToCart={addToCart} onBuyNow={handleBuyNow} categories={categories} />} />
            <Route path="/product/:slug" element={<ProductPage products={productsList} store={store} onAddToCart={addToCart} onBuyNow={handleBuyNow} formatCOP={formatCOP} />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                authLoading ? (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-slate-100 text-green-700">
                    <div className="h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                    <p className="mt-4 text-sm font-semibold">Verificando acceso...</p>
                  </div>
                ) : authUser ? (
                  <Admin />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </section>

      {/* Footer: company contact info (compact) */}
      <footer className="bg-green-700 text-white font-medium py-4 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-center md:text-left">
            <div className="flex items-start justify-center md:justify-start gap-2">
              <span className="text-base" aria-hidden="true">📍</span>
              <span>{store.address}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center md:items-start md:justify-start">
              <a href="tel:6976689" className="inline-flex items-center gap-2 underline">
                <IconPhone className="h-4 w-4" aria-hidden="true" />
                <span>6976689</span>
              </a>
              <a href="https://wa.me/573176693030" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-green-200 transition-colors">
                <IconWhatsApp className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                <span>317 6693030</span>
              </a>
              <a href="https://wa.me/573182969963" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-green-200 transition-colors">
                <IconWhatsApp className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                <span>318 2969963</span>
              </a>
            </div>
            <div className="flex items-start justify-center md:justify-start gap-2">
              <span className="text-base" aria-hidden="true">✉️</span>
              <a href={`mailto:${(store.email || "").trim()}`} className="underline">{(store.email || "").trim()}</a> 
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-white/90">
            © 2025 Senalmaq - Todos los derechos reservados
          </div>
        </div>
      </footer>
      {/* Drawer móvil (usa Links tambiÃ©n) */}
      <AnimatePresence>
        {sidebarOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
          <motion.div className="absolute left-0 top-0 bottom-0 w-[92vw] max-w-[380px] md:max-w-[320px] bg-white shadow-xl p-4 overflow-y-auto scroll-smooth max-h-screen"
               style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
               initial={{ x: -28, opacity: 0 }}
               animate={{ x: 0, opacity: 1, transition: { ease: 'easeOut', duration: 0.28 } }}
               exit={{ x: -28, opacity: 0, transition: { ease: 'easeIn', duration: 0.22 } }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-green-800">Categorías</h4>
              <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar"><IconClose /></button>
            </div>
            <div className="grid gap-2">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="block w-full p-3 rounded-xl bg-white shadow-md font-bold text-base text-center text-green-800 transition duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="mr-2" aria-hidden="true">🏠</span> Inicio
              </Link>
              {categories.map(c => (
                <Link
                  key={c.name}
                  to={`/c/${slugify(c.name)}`}
                  onClick={() => setSidebarOpen(false)}
                  className="block w-full p-3 rounded-xl bg-white shadow-md font-bold text-base text-center text-green-800 transition duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      {/* Toast notifications (top-centered, animated) */}
      {notifications.length > 0 && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] space-y-3">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="flex items-center gap-2 bg-green-600 text-white font-bold text-base md:text-lg px-6 py-4 rounded-xl shadow-xl ring-1 ring-black/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden="true">
                  <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{n.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Checkout overlay */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-lg font-bold text-green-800">Carrito</h3>
                <button onClick={() => setCheckoutOpen(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Cerrar">
                  <IconClose className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto scroll-smooth px-4 py-3">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-600">Tu carrito esta vacio.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex w-full sm:w-48 flex-col items-start gap-2 min-w-0">
                          <img src={item.image || '/images/default.png'} alt={item.name} className="h-14 w-14 rounded-lg object-contain border border-gray-200 bg-gray-50" />
                          <span className="text-sm font-semibold text-green-800 truncate w-full">{item.name}</span>
                        </div>
                        <div className="flex w-full sm:w-auto items-center justify-start sm:justify-center gap-2 sm:gap-3">
                          <button type="button" onClick={() => decreaseQty(item.id)} className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">-</button>
                          <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-700">{item.qty}</span>
                          <button type="button" onClick={() => increaseQty(item.id)} className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">+</button>
                        </div>
                        <div className="flex w-full sm:w-28 flex-col items-end text-right">
                          <span className="text-base font-semibold text-green-600">{formatCOP(item.price * item.qty)}</span>
                          <button type="button" onClick={() => removeItem(item.id)} className="mt-1 text-xs text-red-500 hover:text-red-600">Quitar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t bg-gray-50 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Envio</span>
                  <span className="font-semibold">{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-green-700">
                  <span>Total</span>
                  <span className="text-lg font-bold text-green-700">{formatCOP(total)}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`${store.whatsapp}?text=${encodeURIComponent(whatsappMessage())}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 min-w-[200px] bg-green-700 hover:bg-green-800 text-white text-center py-2 rounded-lg"
                  >
                    Finalizar por WhatsApp
                  </a>
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700">
                      Vaciar carrito
                    </button>
                  )}
                  <button onClick={() => setCheckoutOpen(false)} className="px-3 py-2 rounded-lg border border-green-200 text-green-700">
                    Seguir comprando
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </BrowserRouter>
  );
}
function ShortsRail({ ids = [], youtubeUrl }) {
  if (!ids.length) return null;

  const link = (youtubeUrl || STATIC_STORE.social.youtube || "").trim();

  return (
    <motion.section
      className="max-w-6xl mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-green-800">Shorts destacados</h3>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="text-green-700 text-sm hover:underline">
            Ver canal +
          </a>
        )}
      </div>

      <HSlider>
        {ids.map((id) => (
          <div key={id} className="min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] snap-start bg-white rounded-2xl shadow p-2">
            <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: "177%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
                title={`Short ${id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </HSlider>
    </motion.section>
  );
}


// Simple Home page component
function Home({ products = [], loading = false, error = "", onAddToCart, onBuyNow, store, categories, socialError = "", socialLoading = false }) {
  const showLoading = loading && !products.length;
  const showError = !loading && !!error && !products.length;

  const instagramLink = (store?.social?.instagram || "").trim();
  const youtubeLink = (store?.social?.youtube || "").trim();
  const tiktokLink = (store?.social?.tiktok || "").trim();
  const whatsappLink = (store?.whatsapp || STATIC_STORE.whatsapp || "").trim();
  return (
    <>

      {showLoading && (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">
            Cargando productos...
          </div>
        </div>
      )}

      {showError && (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="rounded-2xl bg-red-100 p-6 text-center text-sm font-semibold text-red-700 shadow">
            {error}
          </div>
        </div>
      )}

      {socialError && (
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm font-semibold text-yellow-800 shadow">
            {socialError}
          </div>
        </div>
      )}

      {/* Video + Redes */}
      <section className="max-w-screen-xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-3">
          <div className="aspect-video rounded-xl overflow-hidden w-full">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${store.social.videoId}?rel=0`}
              title="Video destacado"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
          <h3 className="font-bold text-green-800 text-lg">
            {socialLoading ? "Cargando redes..." : "Siguenos"}
          </h3>
          {instagramLink && (
            <a
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-700 px-3 py-2 rounded-lg"
            >
              <IconInstagram /> Instagram
            </a>
          )}
          {youtubeLink && (
            <a
              href={youtubeLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg"
            >
              <IconYouTube /> YouTube
            </a>
          )}
          {tiktokLink && (
            <a
              href={tiktokLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-black/5 hover:bg-black/10 text-black px-3 py-2 rounded-lg"
            >
              <IconTikTok /> TikTok
            </a>
          )}
          {whatsappLink && (
            <a
              href={`${whatsappLink}?text=${encodeURIComponent("Hola, vengo del video. Quiero m?s info.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-lg"
            >
              Escribenos por WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* Hero / Bienvenida */}
      {/* Shorts (verticales) */}
      <ShortsRail ids={store.social.shorts} youtubeUrl={store.social.youtube} />

      <BestSellers />

      {/* Categorías: grid responsiva sin íconos */}
      <section className="max-w-screen-xl mx-auto px-4 py-6 hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            to="/"
            className="group rounded-xl bg-white p-3 text-center shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg select-none"
            aria-label="Ir a Inicio"
          >
            <span className="block font-bold text-lg text-green-800 truncate">🏠 Inicio</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/c/${slugify(c.name)}`}
              className="group rounded-xl bg-white p-3 text-center shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg select-none"
              aria-label={`Ver categoría ${c.name}`}
            >
              <span className="block font-bold text-lg text-green-800 truncate">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
{/* Categorías (solo móvil, con scroll propio) */}
{false && (
  <div className="sm:hidden">
    <VSlider scrollable maxHeight="68vh">
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/c/${slugify(c.name)}`}
            className="bg-white rounded-2xl shadow border border-green-100 p-3 flex items-center gap-2"
          >
            <c.icon className="h-5 w-5 text-green-700" />
            <span className="text-[13px] font-semibold">{c.name}</span>
          </Link>
        ))}
      </div>
    </VSlider>
  </div>
)}


    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-4 shadow grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-green-800">Coser & Crecer</h2>
          <p className="mt-6 text-base text-gray-700">
           Servir a cada cliente con excelencia e integridad para que su taller florezca, honrando a Dios al ayudarles a trabajar con orden y calidad (Col 3:23).
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={`${store.whatsapp}?text=${encodeURIComponent("Hola, quisiera asesorÃ­a sobre mÃ¡quinas de coser.")}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Conversar por WhatsApp
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <img src="/images/senalmaq.png" alt="Senalmaq"
               className="rounded-xl object-cover w-full h-56 md:h-72 object-center" />
        </div>
      </div>
    </section>
  </>
);
}
// Category page component
function CategoryPage({ products = [], loading = false, error = "", onAddToCart, onBuyNow, categories = [] }) {
  const { slug } = useParams();
  const location = useLocation();

  const categoryName = categories.find(c => slugify(c.name) === slug)?.name || "CategorA-a no encontrada";
  const categoryDescription = `Explora máquinas y accesorios en la categoría ${categoryName}.`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://senalmaq.com";
  const categoryUrl = `${origin}${location.pathname}`;
  const filteredProducts = useMemo(() => products.filter(p => slugify(p.category) === slug), [products, slug]);
  const showLoading = loading && !filteredProducts.length;
  const showError = !loading && !!error && !filteredProducts.length;

  return (
    <div>
      <Helmet>
        <title>Senalmaq | Categoría {categoryName}</title>
        <meta name="description" content={categoryDescription} />
        <meta property="og:title" content={`Senalmaq | Categoría ${categoryName}`} />
        <meta property="og:description" content={categoryDescription} />
        <meta property="og:url" content={categoryUrl} />
        <link rel="canonical" href={categoryUrl} />
      </Helmet>
      
      <div className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800 tracking-tight">{categoryName}</h2>
        <div className="mt-2 flex justify-center">
          <span className="inline-block h-1 w-16 rounded bg-green-500"></span>
        </div>
      </div>

      {showLoading ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">Cargando productos...</div>
      ) : showError ? (
        <div className="rounded-2xl bg-red-100 p-6 text-center text-sm font-semibold text-red-700 shadow">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <p>No hay productos en esta categorA-a.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 flex flex-col transform transition-transform duration-200 ease-out md:hover:scale-105">
              <div className="relative w-full aspect-[4/3] mb-2 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex items-center justify-center group">
                <img src={product.image || "/images/default.png"} alt={product.name} className="w-full h-full object-contain" />
                <Link
                  to={`/product/${getProductSlug(product)}`}
                  className="absolute inset-0 focus:outline-none"
                  aria-label={`Ver mas de ${product.name}`}
                >
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors pointer-events-none" />
                  <span className="absolute bottom-2 right-2 bg-white/90 text-green-800 text-xs font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Ver mas
                  </span>
                </Link>
              </div>
              <h3 className="font-bold text-green-800 text-lg truncate">{product.name}</h3>
              <p className="text-green-700 font-extrabold text-xl">{formatCOP(product.price)}</p>
              <ExpandableText text={product.description} maxLength={90} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (typeof onAddToCart === "function") && onAddToCart(product)}
                  className="bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:shadow-lg transform hover:-translate-y-[2px]"
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={() => (typeof onBuyNow === "function") && onBuyNow(product)}
                  className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 hover:shadow-lg transform hover:-translate-y-[2px]"
                >
                  Comprar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

