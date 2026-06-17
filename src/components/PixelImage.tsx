// image-rendering: pixelated → amplia sem borrar; troca src a cada tick pra revelar em degraus
export function PixelImage({ src, revealed }: { src: string; revealed?: boolean }) {
  return (
    <div className="media-frame">
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
    </div>
  );
}
