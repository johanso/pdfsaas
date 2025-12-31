'use client';
import { FileText, Upload } from "lucide-react";
import { Button } from "../ui/button";

const CTA = (
  {
    title,
    description,
    buttonLabel,
    goto,
  }: {
    title: string;
    description: string;
    buttonLabel: string;
    goto?: string;
  }
) => {

  const handleScroll = (id: string | undefined) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-18 bg-foreground dark:bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-8">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-background dark:text-foreground mb-4">{title}</h2>
          <p className="text-background/70 dark:text-foreground/70 mb-4 max-w-xl mx-auto">{description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="lg" className="w-full max-w-xs sm:w-auto text-md px-8 py-6" onClick={() => handleScroll(goto)}>
              {buttonLabel}
              <span className="mx-2 w-0.5 h-6 bg-background dark:bg-foreground opacity-20" aria-hidden="true" />
              <Upload className="transition-transform group-hover:translate-x-1 size-5!" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
