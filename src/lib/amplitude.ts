import * as amplitude from '@amplitude/analytics-browser';

export const initAmplitude = () => {
  amplitude.init('14616a575f32087cf0403ab8f3ea3ce0');
};

export const track = amplitude.track;
