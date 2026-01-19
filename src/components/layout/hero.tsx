"use client";

import { ArrowRight, FileText, Zap, Shield, Check } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 lg:min-h-[500px]">
          {/* LEFT SIDE - Content */}
          <div className="flex items-center py-8 lg:py-0">
            <div className="w-full space-y-6">
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 animate-fade-in"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">
                  Herramientas online
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] animate-fade-in-up"
                  style={{ animationDelay: "100ms" }}
                >
                  Edita tus PDF
                  <span className="block gradient-text">sin límites</span>
                </h1>
              </div>

              {/* Description */}
              <p
                className="text-base text-muted-foreground leading-relaxed max-w-md animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                Más de 20 herramientas profesionales para editar, convertir y optimizar documentos PDF. Procesamiento local, gratis y sin registro.
              </p>

              {/* Features List */}
              <div
                className="space-y-2.5 animate-fade-in-up"
                style={{ animationDelay: "250ms" }}
              >
                {[
                  "Sin marcas de agua ni publicidad",
                  "Procesamiento 100% privado",
                  "Archivos de hasta 150MB"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                className="pt-2 animate-fade-in-up"
                style={{ animationDelay: "300ms" }}
              >
                <Link href="#features">
                  <Button
                    size="lg"
                    className="group gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                  >
                    Ver todas las herramientas
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Visual */}
          <div className="relative flex items-center justify-center py-8 lg:py-0">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl" />

            {/* Decorative elements */}
            <div className="relative w-full max-w-md">
              {/* Main card - Center */}
              <div
                className="relative z-10 p-6 bg-gradient-card border border-border/50 rounded-2xl shadow-2xl backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      documento-final.pdf
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      24 páginas · 8.5 MB
                    </p>
                  </div>
                </div>

                {/* Progress indicators */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Procesando</span>
                      <span className="text-primary font-medium">78%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                        style={{ width: '78%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card top-left */}
              <div
                className="absolute -top-4 -left-4 lg:-left-8 p-3 bg-gradient-card border border-border/50 rounded-xl shadow-xl backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Rápido</p>
                    <p className="text-xs text-muted-foreground">2.5s</p>
                  </div>
                </div>
              </div>

              {/* Floating card bottom-right */}
              <div
                className="absolute -bottom-4 -right-4 lg:-right-8 p-3 bg-gradient-card border border-border/50 rounded-xl shadow-xl backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: "350ms" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Seguro</p>
                    <p className="text-xs text-muted-foreground">100%</p>
                  </div>
                </div>
              </div>

              {/* Decorative blur circles */}
              <div className="absolute top-1/4 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl -z-10" />
              <div className="absolute bottom-1/4 -left-12 w-32 h-32 rounded-full bg-accent/10 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .gradient-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </section>
  );
};

export default Hero;
