// Rejilla de platos similares (isla: las tarjetas usan favoritos).
import ProductCard from './ProductCard.jsx';

export default function Similares({ productos }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {productos.map((p) => (
        <ProductCard key={p.id_producto} producto={p} />
      ))}
    </div>
  );
}
