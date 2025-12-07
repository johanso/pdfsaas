import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUp, Trash2, LayoutGrid, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <main className="max-w-4xl w-full flex flex-col items-center text-center space-y-12 py-16">

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Herramientas PDF <span className="text-primary">Simples y Potentes</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Gestiona tus documentos PDF con facilidad. Une, organiza, elimina páginas y más.
            Todo de forma local y segura en tu navegador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
          {/* Unir PDF Card */}
          <Link href="/unir-pdf" className="group">
            <div className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-[1.02] hover:border-primary/50 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unir PDF</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Combina múltiples archivos PDF en un solo documento ordenado de forma rápida.
                </p>
              </div>
              <div className="mt-6 flex items-center text-primary font-medium">
                Comenzar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Eliminar Paginas Card */}
          <Link href="/eliminar-paginas-pdf" className="group">
            <div className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-8 hover:shadow-xl transition-all hover:scale-[1.02] hover:border-primary/50 text-left flex flex-col justify-between">
              <div>
                <div className="mb-4 bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Eliminar Páginas</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Selecciona y elimina páginas específicas de tu PDF, rota y reordena antes de descargar.
                </p>
              </div>
              <div className="mt-6 flex items-center text-red-500 font-medium">
                Comenzar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}
