import type { JSX, SVGProps } from "react";

const withFallbackClass = (
  className: string | undefined,
  fallback: string
): string => className ?? fallback;

export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = (props: IconProps) => JSX.Element;

export const IconMenu: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const IconClose: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconInstagram: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
);

export const IconYouTube: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M23 12s0-3.6-.46-5.19a2.86 2.86 0 0 0-2-2C18.9 4.27 12 4.27 12 4.27s-6.9 0-8.54.54a2.86 2.86 0 0 0-2 2C.99 8.4 1 12 1 12s0 3.6.46 5.19a2.86 2.86 0 0 0 2 2C5.1 19.73 12 19.73 12 19.73s6.9 0 8.54-.54a2.86 2.86 0 0 0 2-2C23 15.6 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z" />
  </svg>
);

export const IconWhatsApp: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M20.52 3.48A11.77 11.77 0 0 0 12.06 1 11.94 11.94 0 0 0 2 12a11.76 11.76 0 0 0 1.64 6L2 23l5.11-1.33A12.08 12.08 0 0 0 12.06 23h.05A11.94 11.94 0 0 0 23 11.95a11.77 11.77 0 0 0-2.48-8.47ZM12.11 21a9.92 9.92 0 0 1-5.05-1.39l-.36-.21-3 .78.8-2.92-.23-.38A9.76 9.76 0 0 1 4 12 9.94 9.94 0 0 1 12.06 3 9.77 9.77 0 0 1 21 12a9.94 9.94 0 0 1-8.89 9ZM17.4 14.22c-.3-.15-1.78-.88-2.05-.98s-.47-.15-.67.15-.77.98-.94 1.18-.35.23-.65.08a8.07 8.07 0 0 1-2.37-1.47 8.8 8.8 0 0 1-1.63-2c-.17-.3 0-.45.13-.6s.3-.35.45-.52a1 1 0 0 0 .3-.52.57.57 0 0 0-.03-.52c-.08-.15-.67-1.62-.92-2.22s-.5-.45-.67-.46h-.58a1.11 1.11 0 0 0-.8.38 3.37 3.37 0 0 0-1.05 2.5 5.86 5.86 0 0 0 1.24 3.09c.15.2 2.4 3.66 5.82 5a19.91 19.91 0 0 0 2 .74 4.7 4.7 0 0 0 2.16.14 3.53 3.53 0 0 0 2.31-1.63 3 3 0 0 0 .21-1.62c-.1-.15-.27-.23-.57-.38Z" />
  </svg>
);

export const IconPhone: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.59-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.59A2 2 0 0 1 4.16 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.77.7 2.6a2 2 0 0 1-.45 2.11L8.09 9.75a16 16 0 0 0 6.16 6.16l1.32-1.32a2 2 0 0 1 2.11-.45c.83.34 1.7.58 2.6.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

export const IconSearch: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-4 w-4")}
    {...props}
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconSewingMachine: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <rect x="8" y="20" width="48" height="20" rx="2" ry="2" />
    <circle cx="20" cy="30" r="3" />
    <path d="M56 24v12M8 40v4h48v-4" />
  </svg>
);

export const IconGear: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.5 1.2.66 1.82.33h.09c.61-.24 1-.84 1-1.51V3a2 2 0 1 1 4 0v.09c0 .67.39 1.27 1 1.51.45.18.95.11 1.34-.16.39.27.89.34 1.34.16l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.27.39-.34.89-.16 1.34.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.67 0-1.27.39-1.51 1z" />
  </svg>
);

export const IconSpool: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <rect x="12" y="8" width="40" height="8" rx="2" />
    <rect x="12" y="48" width="40" height="8" rx="2" />
    <line x1="12" y1="16" x2="12" y2="48" />
    <line x1="52" y1="16" x2="52" y2="48" />
    <line x1="20" y1="20" x2="44" y2="44" />
    <line x1="20" y1="44" x2="44" y2="20" />
  </svg>
);

export const IconFabricRoll: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <rect x="8" y="16" width="40" height="32" rx="4" />
    <circle cx="48" cy="32" r="8" />
    <path d="M56 24v16" />
  </svg>
);

export const IconShoppingCart: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 11.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const IconScissors: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="14" cy="6" r="3" />
    <path d="M8.5 8.5L21 21" />
    <path d="M21 3l-9 9" />
  </svg>
);

export const IconWrench: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M14.7 6.3a5 5 0 1 1-4.4 8.4L3 22l.9-7.3A5 5 0 0 1 14.7 6.3z" />
  </svg>
);

export const IconPackage: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" />
    <path d="M7.5 4.21 12 6.5l4.5-2.29" />
  </svg>
);

export const IconNeedle: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M2 22c0-4 8-14 14-18" />
    <path d="M20 4v4" />
    <path d="M17 7l3 3" />
  </svg>
);

export const IconShirt: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M4 7l5-3 3 2 5-2 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
  </svg>
);

export const IconTikTok: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M16 3a5 5 0 0 0 4 4.9v2.1a8.1 8.1 0 0 1-4-1.1v6a6 6 0 1 1-6-6c.35 0 .68.03 1 .08v2.27A3.8 3.8 0 0 0 10 11a4 4 0 1 0 4 4V3h2z" />
  </svg>
);

export const IconSun: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.42 1.42" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.35 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const IconMoon: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-5 w-5")}
    {...props}
  >
    <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
  </svg>
);

export const IconChevronLeft: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight: IconComponent = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={withFallbackClass(className, "h-6 w-6")}
    {...props}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const CATEGORY_ICON_MAP = {
  gear: IconGear,
  scissors: IconScissors,
  shirt: IconShirt,
  needle: IconNeedle,
  package: IconPackage,
  wrench: IconWrench,
} as const;

export type CategoryIconKey = keyof typeof CATEGORY_ICON_MAP;

export const getCategoryIconComponent = (
  key?: string | null
): IconComponent => {
  if (!key) {
    return IconGear;
  }
  return CATEGORY_ICON_MAP[key as CategoryIconKey] ?? IconGear;
};

