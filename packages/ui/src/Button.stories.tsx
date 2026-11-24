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

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">Lưu thay đổi</Button>
      <Button {...args} variant="secondary">Hủy</Button>
      <Button {...args} variant="ghost">Xem chi tiết</Button>
      <Button {...args} variant="danger">Xóa bài nộp</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="md">Nộp bài</Button>
      <Button {...args} size="sm">Nộp bài</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">Lưu thay đổi</Button>
      <Button {...args} variant="secondary">Hủy</Button>
      <Button {...args} variant="ghost">Xem chi tiết</Button>
      <Button {...args} variant="danger">Xóa bài nộp</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { icon: "send", children: "Nộp bài" },
};
