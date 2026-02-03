import { Dimensions, PixelRatio } from 'react-native';
import Global from '../screens/Global';

const { width, height } = Dimensions.get('window');

const widthToDp = number => {
  let givenWidth = typeof number == 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel((width * givenWidth) / 100) > 1
    ? Math.round(PixelRatio.roundToNearestPixel((width * givenWidth) / 100), 0)
    : 1;
};

const heightToDp = number => {
  let givenHeight = typeof number == 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel((height * givenHeight) / 100) > 1
    ? Math.round(
      PixelRatio.roundToNearestPixel((height * givenHeight) / 100),
      0,
    )
    : 1;
};

const responsiveFont = number => {
  return Global.fontScale > 1 ? number / Global.fontScale : number
}

const heightToDpScale = number => {
  let givenHeight = typeof number == 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel((height * givenHeight) / (100 * (Global.fontScale > 1 ? Global.fontScale : 1)))
};

export {  widthToDp, heightToDp, heightToDpScale,  responsiveFont};
