const radianceScale = {
  veryLow: "#6C748A",
  low: "#8AA58B",
  medium: "#E5C98A",
  high: "#D88A70",
  veryHigh: "#C76B4A",
  extreme: "#B55239",
  nodata: "#9A9A9A",
};

export const getBalloonColor = (radiance) => {
  if (radiance === null || radiance === -999) return radianceScale.nodata;

  if (radiance < 1) return radianceScale.veryLow;
  if (radiance < 5) return radianceScale.low;
  if (radiance < 10) return radianceScale.medium;
  if (radiance < 20) return radianceScale.high;
  if (radiance < 30) return radianceScale.veryHigh;
  return radianceScale.extreme;
};
