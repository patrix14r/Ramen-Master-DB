// Animaciones compartidas con framer-motion; todas respetan prefers-reduced-motion.
import { motion, useReducedMotion } from 'framer-motion';

// Curva suave de entrada (desacelera al final).
const SUAVE = [0.22, 1, 0.36, 1];

// Aparece desde abajo (fade-up) la primera vez que entra en pantalla.
export function Revelar({ children, retraso = 0, className = '', y = 24 }) {
  const reducir = useReducedMotion();
  // Sin animación si el usuario pidió menos movimiento.
  if (reducir) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay: retraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}

// Contenedor que escalona la entrada de sus hijos <Item>.
export function Escalonado({ children, className = '', paso = 0.08, inmediato = false }) {
  const reducir = useReducedMotion();
  if (reducir) return <div className={className}>{children}</div>;
  const visible = { opacity: 1, y: 0, transition: { staggerChildren: paso, delayChildren: 0.05 } };
  return (
    <motion.div
      className={className}
      initial="oculto"
      // inmediato = al cargar (hero); si no, al hacer scroll.
      {...(inmediato ? { animate: 'visible' } : { whileInView: 'visible', viewport: { once: true, margin: '0px 0px -60px 0px' } })}
      variants={{ oculto: {}, visible }}
    >
      {children}
    </motion.div>
  );
}

// Hijo de <Escalonado>: sube y aparece en su turno.
export function Item({ children, className = '', y = 22 }) {
  const reducir = useReducedMotion();
  if (reducir) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        oculto: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: SUAVE } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Envuelve una tarjeta con micro-interacción: se eleva al pasar y se hunde al tocar.
export function Tarjeta({ children, className = '', as = 'article' }) {
  const reducir = useReducedMotion();
  const Etiqueta = motion[as];
  return (
    <Etiqueta
      className={className}
      whileHover={reducir ? undefined : { y: -4 }}
      whileTap={reducir ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {children}
    </Etiqueta>
  );
}

// Exporta motion para casos puntuales (menús con AnimatePresence, etc.).
export { motion, useReducedMotion };
export { AnimatePresence } from 'framer-motion';
