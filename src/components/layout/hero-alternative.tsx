"use client";

import { Sparkles, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const HeroAlternative = () => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-20">
      {/* Background decoration - Asymmetric */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Small badge */}
            <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                100% gratuito y seguro
              </span>
            </div>

            {/* Main heading - Asymmetric */}
            <div className="space-y-2">
              <h1
                className="text-4xl font-bold tracking-tight text-foreground animate-fade-in-up sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "100ms" }}
              >
                Herramientas PDF
              </h1>
              <h2
                className="text-4xl font-bold tracking-tight gradient-text animate-fade-in-up sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "150ms" }}
              >
                profesionales
              </h2>
            </div>

            {/* Description - Compact */}
            <p
              className="text-base text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              Edita, convierte, une y optimiza tus documentos PDF.
              Sin registro, sin marcas de agua, sin límites.
            </p>

            {/* CTA */}
            <div
              className="flex flex-wrap gap-3 animate-fade-in-up"
              style={{ animationDelay: "250ms" }}
            >
              <Link href="#features">
                <Button
                  size="lg"
                  className="group gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  Explorar herramientas
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Features Cards */}
          <div
            className="lg:col-span-5 space-y-3 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            {/* Feature Card 1 */}
            <div className="p-4 bg-gradient-card border border-border/50 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Procesamiento rápido
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Edita archivos de hasta 150MB sin demoras
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="p-4 bg-gradient-card border border-border/50 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    100% privado y seguro
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tus archivos se procesan localmente en tu navegador
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">+1M usuarios</span> confían en nuestras herramientas para procesar sus documentos
              </p>
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

export default HeroAlternative;
