// Sección "Recomendaciones del Itamae": platos con es_recomendado (slider con peek).
import { useEffect, useState } from 'react';
import Carrusel from './Carrusel.jsx';
import ProductCard from './ProductCard.jsx';
import Esqueleto from './Esqueleto.jsx';
import { Revelar } from './Anim.jsx';
import { listarProductos } from '../lib/api';

export default function Itamae() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listarProductos()
      .then((lista) => setProductos(lista.filter((p) => p.es_recomendado).slice(0, 6)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudo cargar la selección del Itamae.</p>;
  if (!productos) return <Esqueleto alto="h-[26rem]" />;

  return (
    <Revelar>
      <Carrusel items={productos} renderItem={(p) => <ProductCard producto={p} variante="grande" />} />
    </Revelar>
  );
}
