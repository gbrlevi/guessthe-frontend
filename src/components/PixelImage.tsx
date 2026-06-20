// image-rendering: pixelated → amplia sem borrar; o backend troca o src a cada
// tick (níveis de pixelização) e, no reveal, manda a imagem nítida.
export function PixelImage({ src, revealed }: { src: string; revealed?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        imageRendering: revealed ? "auto" : "pixelated",
      }}
    />
  );
}
