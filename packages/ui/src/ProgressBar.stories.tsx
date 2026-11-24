import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./primitives";

const meta = {
  title: "Primitives/ProgressBar",
  component: ProgressBar,
  args: { value: 60, max: 100, label: "Tiến độ bài học" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: { type: "number", min: 1 } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NoLabel: Story = { args: { label: undefined } };

export const Empty: Story = { args: { value: 0 } };

export const Full: Story = { args: { value: 100 } };

export const CustomValueText: Story = { args: { value: 3, max: 4, valueText: "3/4 bài" } };
