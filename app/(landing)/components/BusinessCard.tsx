interface BusinessCardProps {
  name: string;
  description: string;
  imageUrl: string;
  className?: string;
}

export function BusinessCard({ name, description, imageUrl, className }: BusinessCardProps) {
  return (
    <div className={`flex h-full flex-col gap-4 rounded-lg w-60 flex-shrink-0 ${className || ""}`}>
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex flex-col"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={`Image of ${name}`}
      />
      <div>
        <p className="text-foreground text-base font-medium leading-normal">
          {name}
        </p>
        <p className="text-muted-foreground text-sm font-normal leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
