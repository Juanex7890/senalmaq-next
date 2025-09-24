import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBi34J-Y5FoNhR48xdwk0saCvsyNJ4TJRM",
  authDomain: "senalmaq-68ae5.firebaseapp.com",
  projectId: "senalmaq-68ae5",
  storageBucket: "senalmaq-68ae5.firebasestorage.app",
  messagingSenderId: "643534078633",
  appId: "1:643534078633:web:016ae37a6aee2aef9a1fb8",
  measurementId: "G-18YHT6B0RQ",
};

const app = initializeApp(firebaseConfig);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      /* analytics is optional */
    });
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const PRODUCTS_COLLECTION = "products";
const productsCollection = collection(db, PRODUCTS_COLLECTION);

const SETTINGS_COLLECTION = "settings";
const SOCIAL_DOC_ID = "social";
const socialDocRef = doc(db, SETTINGS_COLLECTION, SOCIAL_DOC_ID);

const CATEGORIES_COLLECTION = "categories";
const categoriesCollection = collection(db, CATEGORIES_COLLECTION);

const PRODUCT_DEFAULTS = { bestSeller: false };
const SOCIAL_DEFAULTS = {
  instagram: "",
  youtube: "",
  tiktok: "",
  videoId: "",
  shorts: [] as string[],
};
const CATEGORY_DEFAULTS = { name: "", icon: "gear" };

export type Product = {
  id: string;
  docId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  bestSeller: boolean;
  image: string;
  imageUrl: string;
};

export type SocialData = typeof SOCIAL_DEFAULTS;
export type Category = { id: string; name: string; icon: string };

export function applyProductSchema(data: Partial<Product> = {}): Product {
  const merged = { ...PRODUCT_DEFAULTS, ...data };
  return {
    ...(merged as Product),
    bestSeller: Boolean(merged.bestSeller),
    id: (merged as any).id ?? "",
    docId: (merged as any).docId ?? "",
    name: merged.name ?? "",
    description: merged.description ?? "",
    price: Number(merged.price) || 0,
    category: merged.category ?? "",
    image: (merged as any).image ?? "",
    imageUrl: (merged as any).imageUrl ?? "",
  };
}

export const getProductsCollection = () => productsCollection;
export const getProductDoc = (id: string) => doc(db, PRODUCTS_COLLECTION, id);

export function subscribeToProducts(
  onNext: (snap: any) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(productsCollection, onNext, onError);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!id) {
    return null;
  }
  const snapshot = await getDoc(getProductDoc(id));
  if (!snapshot.exists()) {
    return null;
  }
  return mapProductDocument(snapshot);
}

export async function listProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs
    .map((document) => mapProductDocument(document as QueryDocumentSnapshot<DocumentData>))
    .filter(Boolean) as Product[];
}

export function mapProductDocument(
  document: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData> | null
): Product | null {
  if (!document || !document.exists()) return null;
  const raw = document.data() as Partial<Product> | undefined;
  if (!raw) return null;
  const data = applyProductSchema(raw);
  const legacyId = (data as any)?.id;
  const imageUrl = data.imageUrl || data.image || "";
  return {
    ...data,
    docId: document.id,
    id: legacyId ?? document.id,
    imageUrl,
    image: imageUrl,
  };
}

export function applySocialSchema(data: Partial<SocialData> = {}): SocialData {
  const base = { ...SOCIAL_DEFAULTS, ...data };
  const shorts = Array.isArray(base.shorts)
    ? base.shorts
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value !== "")
    : [];
  return {
    ...SOCIAL_DEFAULTS,
    ...base,
    instagram: base.instagram?.trim() ?? "",
    youtube: base.youtube?.trim() ?? "",
    tiktok: base.tiktok?.trim() ?? "",
    videoId: base.videoId?.trim() ?? "",
    shorts,
  };
}

export function mapSocialDocument(snapshot: any): SocialData {
  if (!snapshot || !snapshot.exists()) {
    return { ...SOCIAL_DEFAULTS };
  }
  return applySocialSchema(snapshot.data());
}

export const getSocialDoc = () => socialDocRef;

export function subscribeToSocial(onNext: (snap: any) => void, onError?: (err: any) => void) {
  return onSnapshot(socialDocRef, onNext, onError);
}

export async function saveSocialData(data: Partial<SocialData> = {}): Promise<SocialData> {
  const payload = applySocialSchema(data);
  await setDoc(socialDocRef, payload, { merge: true });
  return payload;
}

export function applyCategorySchema(data: Partial<Category> = {}): Category {
  const raw = { ...CATEGORY_DEFAULTS, ...data };
  return {
    ...raw,
    id: (raw as any).id ?? "",
    name: raw.name?.trim() ?? "",
    icon: raw.icon?.trim() ?? CATEGORY_DEFAULTS.icon,
  };
}

export function mapCategoryDocument(document: QueryDocumentSnapshot<DocumentData> | null): Category | null {
  if (!document) return null;
  const data = applyCategorySchema(document.data() as Partial<Category>);
  return { ...data, id: document.id };
}

export const getCategoriesCollection = () => categoriesCollection;
export const getCategoryDoc = (id: string) => doc(db, CATEGORIES_COLLECTION, id);

export function subscribeToCategories(onNext: (snap: any) => void, onError?: (err: any) => void) {
  return onSnapshot(categoriesCollection, onNext, onError);
}

function normalizeSlugCandidate(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCategories(): Promise<Category[]> {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs
    .map((document) => mapCategoryDocument(document as QueryDocumentSnapshot<DocumentData>))
    .filter(Boolean) as Category[];
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const normalized = normalizeSlugCandidate(slug);
  const categories = await listCategories();
  return (
    categories.find((category) => normalizeSlugCandidate(category.name) === normalized) ?? null
  );
}

export const getProductImageRef = (docId: string, fileName: string) =>
  ref(storage, `products/${docId}/${fileName}`);

export async function uploadProductImage(
  docId: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!docId || !file) throw new Error("A document ID and file are required to upload an image.");

  const originalName = file.name || "image";
  const safeName = originalName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_.-]/g, "");
  const fileName = `${Date.now()}-${safeName}`;
  const storageRef = getProductImageRef(docId, fileName);
  const metadata = file.type ? { contentType: file.type } : undefined;
  const snapshot = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snapshot.ref);
  return { url, path: snapshot.ref.fullPath };
}

export async function getDownloadUrlForPath(path: string): Promise<string> {
  if (!path) throw new Error("A storage path is required to get a download URL.");
  return getDownloadURL(ref(storage, path));
}

export {
  app,
  auth,
  db,
  storage,
  analytics,
  SOCIAL_DEFAULTS,
  CATEGORY_DEFAULTS,
};
