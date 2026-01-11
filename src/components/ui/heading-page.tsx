
interface HeadingProps {
  titlePage: string;
  descriptionPage: string;
}

export function HeadingPage({ titlePage, descriptionPage }: HeadingProps) {
  return (
    <div className="flex flex-col gap-y-1">
      <h1 className="text-xl md:text-2xl tracking-tight">{titlePage}</h1>
      <p className="text-md text-muted-foreground">{descriptionPage}</p>
    </div>
  );
}