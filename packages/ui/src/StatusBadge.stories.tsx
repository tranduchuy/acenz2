import type { Meta, StoryObj } from "@storybook/react-vite";
import { ASSIGNMENT_STATUS, type AssignmentStatus } from "@acenz/core";
import { StatusBadge } from "./primitives";

const STATUSES = Object.keys(ASSIGNMENT_STATUS) as AssignmentStatus[];

const meta = {
  title: "Primitives/StatusBadge",
  component: StatusBadge,
  args: { status: "graded" },
  argTypes: { status: { control: "select", options: STATUSES } },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {STATUSES.map((s) => <StatusBadge key={s} status={s} />)}
    </div>
  ),
};
