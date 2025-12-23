import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-100 h-100 bg-primary/16 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-100 h-100 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Procesamiento 100% en tu navegador</span>
          </div>

          <h1 className="text-2xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Todas las herramientas PDF
            <span className="block text-3xl md:text-5xl text-primary font-extrabold">Que necesitas</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Unir, dividir, rotar, extraer y organizar tus documentos PDF de manera sencilla.
            Sin instalaciones, sin límites, completamente gratis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              Ver Herramientas
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { value: "2M+", label: "PDFs procesados" },
              { value: "100%", label: "Privado y seguro" },
              { value: "6+", label: "Herramientas" },
              { value: "0€", label: "Para empezar" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;