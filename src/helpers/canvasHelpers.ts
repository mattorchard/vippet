import type {Rect} from "./utilityTypes";

export const createCanvas = (crop: Rect, scale: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = crop.width * scale;
  canvas.height = crop.height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(`Unable to create canvas context`);
  console.log(crop)
  const drawImage = (image: CanvasImageSource) =>
    context.drawImage(
      image,
      crop.left,
      crop.top,
      crop.width,
      crop.height,
      0,
      0,
      crop.width * scale,
      crop.height * scale,
    );

  return { canvas, context, drawImage };
};
