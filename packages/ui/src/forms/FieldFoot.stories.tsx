import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldFoot } from "./FieldFoot";

const meta = {
  title: "Forms/FieldFoot",
  component: FieldFoot,
  args: { hint: "Tên hiển thị trên bảng điểm." },
  decorators: [(Story) => <div className="max-w-105"><Story /></div>],
} satisfies Meta<typeof FieldFoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Hint: Story = {};

export const Error: Story = { args: { hint: undefined, error: "Email chưa đúng định dạng." } };

export const Extra: Story = { args: { extra: <span className="tabular-nums text-ink-muted">120 / 250 từ</span> } };

/** No hint, error or extra: renders nothing. */
export const Empty: Story = { args: { hint: undefined } };
