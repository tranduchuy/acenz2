import type { Meta, StoryObj } from "@storybook/react-vite";
import { SKILLS } from "@acenz/core";
import { SkillTag } from "./primitives";

const meta = {
  title: "Primitives/SkillTag",
  component: SkillTag,
  args: { skill: "writing" },
  argTypes: { skill: { control: "select", options: [...SKILLS] } },
} satisfies Meta<typeof SkillTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllSkills: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {SKILLS.map((s) => <SkillTag key={s} skill={s} />)}
    </div>
  ),
};

export const CustomLabel: Story = { args: { skill: "speaking", children: "Nói · Part 2" } };
