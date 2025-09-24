export interface StoreSocial {
  instagram: string;
  youtube: string;
  tiktok: string;
  videoId: string;
  shorts: string[];
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  social: StoreSocial;
}

export const STORE: StoreInfo = {
  name: "Senalmaq",
  address: "Cra 108a # 139-05 / Calle 139 # 103f 13, Suba, Bogota, Colombia.",
  phone: "+57 317 6693030",
  email: "Cosersenalmaq@gmail.com",
  whatsapp: "https://wa.me/573176693030",
  social: {
    instagram: "https://www.instagram.com/senalmaq",
    youtube: "https://www.youtube.com/@senalmaqcoser",
    tiktok: "https://www.tiktok.com/@senalmaq",
    videoId: "JzGMhsTBoWM",
    shorts: ["K1_3Osgn9MU", "DRJlx83svFU", "IoJ3ppFo6vQ"],
  },
};

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  iconKey: "gear" | "scissors" | "shirt" | "needle" | "package" | "wrench";
}> = [
  { name: "Maquinas De Coser Singer", iconKey: "gear" },
  { name: "Maquinas De Coser Brother", iconKey: "gear" },
  { name: "Planas Mecatronicas", iconKey: "gear" },
  { name: "Maquinas Electronicas", iconKey: "gear" },
  { name: "Fileteadoras Mecatronicas", iconKey: "gear" },
  { name: "Fileteadoras Familiares", iconKey: "gear" },
  { name: "Bordadoras", iconKey: "shirt" },
  { name: "Cortadoras De Tela", iconKey: "scissors" },
  { name: "Planchas", iconKey: "shirt" },
  { name: "Accesorios Extras", iconKey: "shirt" },
  { name: "Lamparas", iconKey: "shirt" },
  { name: "Collarin Industrial", iconKey: "gear" },
  { name: "Planas Electronicas", iconKey: "gear" },
  { name: "Cortadora Vertical", iconKey: "gear" },
  { name: "Maquinas 20u", iconKey: "gear" },
  { name: "Maquinas Para Trabajo Pesado", iconKey: "gear" },
];

