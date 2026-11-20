// Slider de "Los más consumidos" (platos con es_mas_vendido).
import { useEffect, useState } from 'react';
import Carrusel from './Carrusel.jsx';
import TarjetaVisual from './TarjetaVisual.jsx';
import Esqueleto from './Esqueleto.jsx';
import { Revelar } from './Anim.jsx';
import { listarProductos } from '../lib/api';

export default function BestSellers() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listarProductos()
      .then((lista) => setProductos(lista.filter((p) => p.es_mas_vendido)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudo cargar la carta. Revisa que el servidor esté activo.</p>;
  if (!productos) return <Esqueleto alto="h-[26rem]" />;

  return (
    <Revelar>
      <Carrusel items={productos} renderItem={(p) => <TarjetaVisual producto={p} />} />
    </Revelar>
  );
}
