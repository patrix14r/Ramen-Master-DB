// Sección "Recomendaciones del Itamae": platos con es_recomendado.
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import Esqueleto from './Esqueleto.jsx';
import { listarProductos } from '../lib/api';

export default function Itamae() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listarProductos()
      .then((lista) => setProductos(lista.filter((p) => p.es_recomendado).slice(0, 4)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudo cargar la selección del Itamae.</p>;
  if (!productos) return <Esqueleto />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {productos.map((p) => (
        <ProductCard key={p.id_producto} producto={p} />
      ))}
    </div>
  );
}
