/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#FF6B35"; // Orange primary
const tintColorDark = "#FF8C5A"; // Orange primary (lighter for dark mode)

export const Colors = {
  light: {
    text: "#1A1A1A",
    background: "#FFFFFF",
    tint: tintColorLight,
    icon: "#666666",
    tabIconDefault: "#999999",
    tabIconSelected: tintColorLight,
    secondary: "#004E89",
    success: "#2ECC71",
    warning: "#F39C12",
    surface: "#F8F9FA",
    divider: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    background: "#1A1A1A",
    tint: tintColorDark,
    icon: "#AAAAAA",
    tabIconDefault: "#777777",
    tabIconSelected: tintColorDark,
    secondary: "#0066CC",
    success: "#27AE60",
    warning: "#E67E22",
    surface: "#2D2D2D",
    divider: "#404040",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
