import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { label: "Nhắc tôi trước hạn nộp", disabled: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the box and it toggles. */
export const Playground: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} disabled />
      <Checkbox {...args} disabled defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = { args: { description: "Gửi email 24 giờ trước hạn." } };
