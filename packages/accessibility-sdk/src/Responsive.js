import { Dimensions, PixelRatio } from 'react-native';
import runtime from './AccessibilityRuntime';

const { width, height } = Dimensions.get('window');

const widthToDp = (number) => {
  const givenWidth = typeof number === 'number' ? number : parseFloat(number);
  const px = PixelRatio.roundToNearestPixel((width * givenWidth) / 100);
  return px > 1 ? Math.round(px) : 1;
};

const heightToDp = (number) => {
  const givenHeight = typeof number === 'number' ? number : parseFloat(number);
  const px = PixelRatio.roundToNearestPixel((height * givenHeight) / 100);
  return px > 1 ? Math.round(px) : 1;
};

const responsiveFont = (number) => {
  return runtime.fontScale > 1 ? number / runtime.fontScale : number;
};

const heightToDpScale = (number) => {
  const givenHeight = typeof number === 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel(
    (height * givenHeight) / (100 * (runtime.fontScale > 1 ? runtime.fontScale : 1))
  );
};

export { widthToDp, heightToDp, heightToDpScale, responsiveFont };
