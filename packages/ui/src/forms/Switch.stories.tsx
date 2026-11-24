import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  args: { label: "Thông báo qua email", disabled: false },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the switch and it toggles. */
export const Playground: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Switch {...args} disabled />
      <Switch {...args} disabled defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = { args: { description: "Nhận tin khi giáo viên chấm bài." } };
