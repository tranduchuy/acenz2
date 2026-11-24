import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./primitives";

// Inline SVG keeps the story offline; it sets no color so no palette value is hard-coded.
const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="38" r="16"/><rect x="20" y="60" width="56" height="36" rx="18"/></svg>',
  );

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  args: { name: "Nguyễn Minh Anh", size: 40 },
  argTypes: { size: { control: { type: "number", min: 16, max: 128, step: 4 } } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithImage: Story = { args: { src: PHOTO } };

export const SingleWord: Story = { args: { name: "Linh" } };

export const EmptyName: Story = { args: { name: "" } };

export const LongName: Story = { args: { name: "Nguyễn Hoàng Thiên Trúc Lan Anh Phương" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      {[24, 32, 40, 56, 80].map((s) => <Avatar key={s} {...args} size={s} />)}
    </div>
  ),
};
