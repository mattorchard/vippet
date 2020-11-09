export const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(`Unable to create canvas context`);
  return { canvas, context };
};
