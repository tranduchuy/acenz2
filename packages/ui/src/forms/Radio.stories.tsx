import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const OPTIONS = [
  { value: "academic", label: "Academic" },
  { value: "general", label: "General Training" },
];

const meta = {
  title: "Forms/Radio",
  component: Radio,
  args: { name: "module", legend: "Loại bài thi", options: OPTIONS },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click an option and the selection moves. */
export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    name: "module-desc",
    options: [
      { value: "academic", label: "Academic", description: "Dành cho du học và học thuật." },
      { value: "general", label: "General Training", description: "Dành cho định cư và làm việc." },
    ],
  },
};

export const PreSelected: Story = { args: { name: "module-pre", defaultValue: "general" } };
