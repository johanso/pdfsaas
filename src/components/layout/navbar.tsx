"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Grip, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import merge from "@/images/merge.png";

// Definimos los datos aquí para tenerlos a mano
const toolsMenu = [
    {
        category: "Organizar PDF",
        icon: LayoutGrid,
        items: [
            { name: "Unir PDF", href: "/unir-pdf", image: merge, disabled: false },
            { name: "Eliminar", href: "/eliminar-paginas-pdf", image: merge, disabled: false },
            { name: "Dividir PDF", href: "/dividir-pdf", image: merge, disabled: false },
            { name: "Extraer PDF", href: "/extraer-paginas-pdf", image: merge, disabled: false },
            { name: "Rotar PDF", href: "/rotar-pdf", image: merge, disabled: false },
        ],
    },
    {
        category: "Optimizar",
        icon: Zap,
        items: [],
    },
    {
        category: "Convertir",
        icon: FileText,
        items: [],
    },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="h-16 border-b bg-background px-6 flex items-center">
            <div className="container flex items-center justify-between mx-auto py-10 md:px-4 max-w-6xl">
                {/* LADO IZQUIERDO: Logo */}
                <Link href="/" className="flex items-center gap-1 font-bold text-lg">
                    <div className="bg-primary text-primary-foreground px-2 rounded">
                        PDF
                    </div>
                    <span>SaaS</span>
                </Link>

                {/* LADO DERECHO: Trigger del Drawer */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="gap-2 cursor-pointer">
                            <span className="hidden sm:inline">Herramientas PDF</span>
                            <Grip size={32} className="!size-6" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Herramientas PDF</SheetTitle>
                            <SheetDescription>
                                Selecciona una herramienta para comenzar.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-8 flex flex-col gap-6">
                            {toolsMenu.map((group, idx) => (
                                <div key={idx} className="px-4">
                                    <div className="flex items-center gap-2 mb-4 text-md font-semibold">
                                        <group.icon className="h-4 w-4" />
                                        {group.category}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((item) => (
                                            <SheetClose asChild key={item.href}>
                                                <Link
                                                    href={item.disabled ? "#" : item.href}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center w-[31.8%] h-[80px] p-2 border rounded-md text-sm leading-4 text-center transition-colors",
                                                        item.disabled
                                                            ? "opacity-50 cursor-not-allowed bg-muted/50"
                                                            : "hover:bg-muted",
                                                        pathname === item.href && "border-2 border-neutral-900 text-primary font-medium"
                                                    )}
                                                >
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={20}
                                                        height={20}
                                                    />
                                                    <span className="mt-2">{item.name}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                    {idx < toolsMenu.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}