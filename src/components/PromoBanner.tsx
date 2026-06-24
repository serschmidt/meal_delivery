import careplusLogo from "../assets/careplus-logo.png";

export function PromoBanner() {
  return (
    <a
      href="https://www.care-haushaltshilfe.de/ratgeber/essen-auf-radern"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mehr Informationen zu Essen auf Rädern bei Care+"
      className="absolute left-0 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
    >
      <img
        src={careplusLogo}
        alt="Care+ Logo"
        className="h-12 w-auto object-contain"
      />
    </a>
  );
} /*  */
