import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "./preview.css";

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    // Same switch as the app: data-theme on <html> drives every token and `dark:` variant.
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
      parentSelector: "html",
    }),
  ],
};

export default preview;
