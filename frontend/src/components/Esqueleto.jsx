// Rejilla de tarjetas "cargando" que mantiene la altura y evita saltos de diseño.
export default function Esqueleto({ cantidad = 4, alto = 'h-80', columnas = 'sm:grid-cols-2 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${columnas}`} aria-busy="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={`tarjeta animate-pulse ${alto}`} />
      ))}
    </div>
  );
}
