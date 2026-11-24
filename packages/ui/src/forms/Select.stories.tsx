import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const LEVELS = [
  { value: "5.0", label: "Band 5.0" },
  { value: "6.0", label: "Band 6.0" },
  { value: "7.0", label: "Band 7.0" },
];

const meta = {
  title: "Forms/Select",
  component: Select,
  args: { label: "Mục tiêu", options: LEVELS, placeholder: "Chọn mục tiêu", disabled: false },
  decorators: [(Story) => <div className="max-w-105"><Story /></div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { hint: "Bạn có thể đổi sau." } };

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: "6.0" } };

export const Disabled: Story = { args: { defaultValue: "6.0", disabled: true } };

export const Error: Story = { args: { error: "Hãy chọn một mục tiêu." } };

export const LongOption: Story = {
  args: {
    options: [{ value: "long", label: "Lớp luyện thi IELTS cấp tốc cho học viên mục tiêu 7.0 trở lên, học vào buổi tối" }, ...LEVELS],
    defaultValue: "long",
  },
};

export const EmptyOptions: Story = { args: { options: [], placeholder: "Chưa có lựa chọn" } };
