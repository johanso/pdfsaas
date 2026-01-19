"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background gradient editorial */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Minimal floating elements */}
      <div className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[10%] w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float-delayed" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Headline - Clean & Bold */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground leading-[0.95] tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Herramientas
            <span className="block text-primary">
              PDF
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Unir, dividir, rotar, comprimir y organizar documentos PDF.
            Sin instalaciones, completamente gratis.
          </p>

          {/* Single CTA */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="#features">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg font-medium rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                Explorar herramientas
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Hero;