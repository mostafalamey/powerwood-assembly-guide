import { LightingSettings } from "@/types/animation";

export const DEFAULT_LIGHTING_SETTINGS: LightingSettings = {
  hemisphere: {
    skyColor: "#ffffff",
    groundColor: "#444444",
    intensity: 1.5,
  },
  main: {
    color: "#ffffff",
    intensity: 2.0,
    position: { x: 5, y: 10, z: 7.5 },
  },
  fill: {
    color: "#ffffff",
    intensity: 1.0,
  },
  rim: {
    color: "#ffffff",
    intensity: 0.7,
  },
};

export const normalizeLightingSettings = (
  settings?: LightingSettings,
): LightingSettings => ({
  hemisphere: {
    ...DEFAULT_LIGHTING_SETTINGS.hemisphere,
    ...(settings?.hemisphere || {}),
  },
  main: {
    ...DEFAULT_LIGHTING_SETTINGS.main,
    ...(settings?.main || {}),
    position: {
      ...DEFAULT_LIGHTING_SETTINGS.main.position,
      ...(settings?.main?.position || {}),
    },
  },
  fill: {
    ...DEFAULT_LIGHTING_SETTINGS.fill,
    ...(settings?.fill || {}),
  },
  rim: {
    ...DEFAULT_LIGHTING_SETTINGS.rim,
    ...(settings?.rim || {}),
  },
});
