import { IconPhone, IconWhatsApp } from "@/components/icons";
import { STORE } from "@/lib/store";

const WHATSAPP_CONTACTS = [
  { number: "317 6693030", url: "https://wa.me/573176693030" },
  { number: "318 2969963", url: "https://wa.me/573182969963" },
];

export function Footer() {
  const email = (STORE.email || "").trim();

  return (
    <footer className="bg-green-700 text-white font-medium py-4 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-center md:text-left">
          <div className="flex items-start justify-center md:justify-start gap-2">
            <span className="font-semibold">Dirección</span>
            <span>{STORE.address}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center md:items-start md:justify-start">
            <a href="tel:6976689" className="inline-flex items-center gap-2 underline">
              <IconPhone className="h-4 w-4" aria-hidden="true" />
              <span>6976689</span>
            </a>
            {WHATSAPP_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={contact.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-green-200 transition-colors"
              >
                <IconWhatsApp className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                <span>{contact.number}</span>
              </a>
            ))}
          </div>
          <div className="flex items-start justify-center md:justify-start gap-2">
            <span className="font-semibold">Email</span>
            <a href={`mailto:${email}`} className="underline">
              {email}
            </a>
          </div>
        </div>
        <div className="mt-2 text-center text-[10px] text-white/90">
          © {new Date().getFullYear()} {STORE.name} - Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}

export default Footer;
