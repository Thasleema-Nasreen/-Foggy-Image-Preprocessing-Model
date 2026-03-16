interface ImageTriptychProps {
  originalSrc: string;
  dehazedSrc: string;
  darkChannelSrc: string;
}

export function ImageTriptych({
  originalSrc,
  dehazedSrc,
  darkChannelSrc,
}: ImageTriptychProps) {
  const images = [
    { src: originalSrc, label: "Original", alt: "Original foggy image" },
    { src: dehazedSrc, label: "Dehazed (DCP)", alt: "Dehazed image using Dark Channel Prior" },
    { src: darkChannelSrc, label: "Dark Channel", alt: "Dark channel visualization" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {images.map((image, idx) => (
        <div key={idx} className="space-y-2">
          <h4 className="font-semibold text-sm">{image.label}</h4>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted shadow-card">
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
