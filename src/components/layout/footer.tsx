import { FileText, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">PDF Pro</span>
            </a>
            <p className="text-muted-foreground text-sm">
              Herramientas profesionales para trabajar con documentos PDF directamente en tu navegador.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Herramientas</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Unir PDF</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Dividir PDF</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Rotar PDF</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Organizar PDF</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Ayuda</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacidad</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Términos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 PDF Pro. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
