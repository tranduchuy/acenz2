import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  args: { label: "Họ và tên", placeholder: "Nhập họ và tên", disabled: false },
  decorators: [(Story) => <div className="max-w-105"><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { hint: "Tên hiển thị trên bảng điểm." },
};

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: "Nguyễn Minh Anh" } };

export const Disabled: Story = { args: { defaultValue: "Nguyễn Minh Anh", disabled: true } };

export const Error: Story = {
  args: { defaultValue: "anh@", type: "email", label: "Email", error: "Email chưa đúng định dạng." },
};

export const WithHint: Story = { args: { hint: "Dùng tên thật của bạn." } };

export const Multiline: Story = {
  args: { label: "Bài viết", multiline: true, rows: 6, placeholder: "Viết bài của bạn ở đây." },
};

/** Live word count: Writing Task 2 needs 250 words. */
export const WordCount: Story = {
  args: { label: "Writing Task 2", multiline: true, minWords: 250, defaultValue: "Nhiều người cho rằng học trực tuyến hiệu quả hơn." },
};

export const LongValue: Story = {
  args: {
    defaultValue: "Một họ và tên rất dài để kiểm tra việc cắt chữ trong ô nhập liệu khi nội dung vượt quá chiều rộng của trường",
  },
};

export const Empty: Story = { args: { defaultValue: "", placeholder: "" } };
