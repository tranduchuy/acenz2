import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES } from "./Icon";
import { Button } from "./primitives";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Lưu thay đổi",
    variant: "primary",
    size: "md",
    disabled: false,
  },
  argTypes: {
    icon: { control: "select", options: ICON_NAMES },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
