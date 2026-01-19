import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

const FaqsHome = () => {

  const data = {
    titleSectionFAQ: "Preguntas Frecuentes",
    faqs: [
      {
        question: "¿Es seguro subir mis documentos a esta plataforma?",
        answer: "Sí, la seguridad es nuestra máxima prioridad. Utilizamos cifrado SSL de extremo a extremo para proteger tus archivos. Los documentos se eliminan automáticamente de nuestros servidores después de 24 horas."
      },
      {
        question: "¿Necesito instalar algún software para usar estas herramientas?",
        answer: "No, todas las herramientas funcionan directamente en tu navegador. No necesitas instalar nada. Solo necesitas un navegador web moderno y una conexión a internet."
      },
      {
        question: "¿Puedo usar estas herramientas en mi dispositivo móvil?",
        answer: "Sí, nuestra plataforma es totalmente responsive y funciona en cualquier dispositivo con navegador web, incluyendo smartphones, tablets y computadoras de escritorio."
      },
      {
        question: "¿Mis documentos se mantienen privados?",
        answer: "Sí, tus documentos son completamente privados. No compartimos ni vendemos tus datos a terceros. Solo tú tienes acceso a tus archivos."
      },
      {
        question: "¿Puedo usar estas herramientas sin crear una cuenta?",
        answer: "Sí, puedes usar todas las herramientas sin necesidad de crear una cuenta. Todo es gratuito y no requiere registro."
      },
      {
        question: "¿Qué pasa con mis archivos subidos?",
        answer: "Son procesados de forma segura y eliminados permanentemente. Nadie tiene acceso a tu contenido."
      },
    ]
  }
  return (
    <section className="py-12 md:py-16 bg-muted/80 dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Tu suite completa de herramientas PDF gratuitas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Administrar documentos digitales no debería ser complicado ni costoso. Nuestra plataforma te ofrece una suite completa para gestionar archivos PDF online sin necesidad de descargar programas pesados como Adobe Acrobat.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {data.faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/70"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FaqsHome