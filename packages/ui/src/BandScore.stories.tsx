import type { Meta, StoryObj } from "@storybook/react-vite";
import { BandScore } from "./primitives";

const meta = {
  title: "Primitives/BandScore",
  component: BandScore,
  args: { score: 7, size: "md" },
  argTypes: {
    score: { control: { type: "number", min: 0, max: 9, step: 0.5 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof BandScore>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Score 7 renders as "7.0" (one decimal). */
export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      <BandScore {...args} size="sm" />
      <BandScore {...args} size="md" />
      <BandScore {...args} size="lg" />
    </div>
  ),
};

export const WithLabel: Story = { args: { score: 6.5, label: "Tổng", size: "lg" } };

export const Empty: Story = { args: { score: null, label: "Writing" } };
