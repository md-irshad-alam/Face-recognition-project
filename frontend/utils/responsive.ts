export const viewSizeCalculator = (px: number, baseWidth: number = 1440): string => {
  return `${(px / baseWidth) * 100}vw`;
};
