import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckText } from "./CheckText";

const meta = {
  title: "Forms/CheckText",
  component: CheckText,
  args: { label: "Nhắc tôi trước hạn nộp" },
} satisfies Meta<typeof CheckText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = { args: { description: "Gửi email 24 giờ trước hạn." } };
