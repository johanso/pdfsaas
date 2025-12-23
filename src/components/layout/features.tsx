import {
  Layers,
  RotateCw,
  Trash2,
  Scissors,
  FileOutput,
  GripVertical,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers,
    title: "Unir PDF",
    description: "Combina múltiples documentos PDF en un solo archivo de manera rápida y sencilla.",
    color: "bg-orange-500",
  },
  {
    icon: RotateCw,
    title: "Rotar PDF",
    description: "Gira páginas individuales o documentos completos en cualquier dirección.",
    color: "bg-blue-500",
  },
  {
    icon: Trash2,
    title: "Eliminar Páginas",
    description: "Remueve páginas específicas de un documento de forma visual e intuitiva.",
    color: "bg-red-500",
  },
  {
    icon: Scissors,
    title: "Dividir PDF",
    description: "Separa un PDF en múltiples archivos por rangos de páginas o páginas individuales.",
    color: "bg-green-500",
  },
  {
    icon: FileOutput,
    title: "Extraer Páginas",
    description: "Selecciona páginas específicas para crear un nuevo documento personalizado.",
    color: "bg-purple-500",
  },
  {
    icon: GripVertical,
    title: "Organizar PDF",
    description: "Reordena, duplica, rota e inserta páginas en blanco. La herramienta más completa.",
    color: "bg-primary",
    featured: true,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-card">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Herramientas Poderosas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para trabajar con tus documentos PDF, directamente en tu navegador.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border ${feature.featured ? 'ring-2 ring-primary/20 bg-accent/50' : 'bg-card'
                }`}
            >
              <CardContent className="p-6 md:p-5">

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${feature.color} rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <feature.icon className="w-5 h-5 text-primary-foreground" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    {feature.title}
                    {/* {feature.featured && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )} */}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
