
interface HeadingProps {
    titlePage: string;
    descriptionPage: string;
}

export function HeadingPage({ titlePage, descriptionPage }: HeadingProps) {
    return (
        <div className="flex flex-col gap-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{titlePage}</h1>
            <p className="text-md md:text-lg text-muted-foreground">{descriptionPage}</p>
        </div>
    );
}