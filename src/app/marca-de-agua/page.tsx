import type { Metadata } from 'next';
import WatermarkClient from './client';

export const metadata: Metadata = {
  title: 'Agregar Marca de Agua a PDF | Herramienta Online Gratuita',
  description: 'Agrega texto o imágenes como marca de agua a tus documentos PDF. Personaliza posición, transparencia y más. Rápido, seguro y gratuito.',
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
