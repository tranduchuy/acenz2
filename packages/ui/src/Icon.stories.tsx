import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES, Icon } from "./Icon";

const meta = {
  title: "Icons/Icon",
  component: Icon,
  args: { name: "check", size: 24 },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: { type: "number", min: 12, max: 64, step: 2 } },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every name in `ICON_NAMES`, with its name underneath. */
export const AllIcons: Story = {
  render: (args) => (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3 p-0">
      {ICON_NAMES.map((name) => (
        <li key={name} className="flex flex-col items-center gap-2 rounded-md border border-line bg-surface-raised p-3 text-ink">
          <Icon {...args} name={name} />
          <code className="text-caption text-ink-muted">{name}</code>
        </li>
      ))}
    </ul>
  ),
};
