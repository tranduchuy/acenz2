import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  args: { label: "Hạn nộp", defaultValue: new Date(2026, 10, 24) },
  argTypes: { value: { control: false }, defaultValue: { control: "date" } },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the date to open the calendar, then pick a day. */
export const Playground: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const WithHint: Story = { args: { hint: "Học viên nộp bài trước giờ này." } };
