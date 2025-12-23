import { Upload, MousePointer, Download, Check } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Sube tus archivos",
    description: "Arrastra y suelta tus PDFs o selecciónalos desde tu dispositivo. Soportamos múltiples archivos.",
  },
  {
    icon: MousePointer,
    title: "Edita visualmente",
    description: "Usa nuestra interfaz intuitiva para reorganizar, rotar, eliminar o combinar páginas.",
  },
  {
    icon: Download,
    title: "Descarga el resultado",
    description: "Obtén tu PDF procesado al instante. Sin marcas de agua, sin límites.",
  },
];

const benefits = [
  "Procesamiento 100% local en tu navegador",
  "Tus archivos nunca salen de tu dispositivo",
  "Sin registro ni instalación requerida",
  "Funciona offline después de cargar",
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cómo Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos para transformar tus documentos PDF
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
              )}

              <div className="relative z-10 w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <step.icon className="w-10 h-10 text-primary-foreground" />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-card border-2 border-primary rounded-full flex items-center justify-center font-bold text-primary">
                  {index + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-foreground text-center mb-8">
            ¿Por qué elegirnos?
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
