import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES } from "./Icon";
import { Badge } from "./primitives";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  args: { tone: "success", children: "Đã chấm" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
    icon: { control: "select", options: [false, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="neutral">Chưa nộp</Badge>
      <Badge tone="info">Đã nộp</Badge>
      <Badge tone="success">Đã chấm</Badge>
      <Badge tone="warning">Sắp đến hạn</Badge>
      <Badge tone="danger">Nộp muộn</Badge>
    </div>
  ),
};

export const CustomIcon: Story = { args: { tone: "info", icon: "send", children: "Đang gửi" } };

export const NoIcon: Story = { args: { tone: "success", icon: false, children: "Đã chấm" } };
