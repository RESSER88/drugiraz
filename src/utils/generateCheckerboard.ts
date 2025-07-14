
export const generateCheckerboardDataURL = (
  size: number = 400, 
  squareSize: number = 50, 
  color1: string = '#000000', 
  color2: string = '#FFFFFF'
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const squares = Math.floor(size / squareSize);
  
  for (let row = 0; row < squares; row++) {
    for (let col = 0; col < squares; col++) {
      const isEvenSquare = (row + col) % 2 === 0;
      ctx.fillStyle = isEvenSquare ? color1 : color2;
      ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
    }
  }
  
  return canvas.toDataURL();
};

export const generateBlackWhiteCheckerboard = (): string => {
  return generateCheckerboardDataURL(400, 50, '#000000', '#FFFFFF');
};

export const generateBlueYellowCheckerboard = (): string => {
  return generateCheckerboardDataURL(400, 50, '#0066CC', '#FFCC00');
};
