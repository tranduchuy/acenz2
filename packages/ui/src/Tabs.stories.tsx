import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./primitives";

const ITEMS = [
  { value: "all", label: "Tất cả" },
  { value: "todo", label: "Cần làm" },
  { value: "done", label: "Đã nộp" },
];

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  args: { items: ITEMS, defaultValue: "all" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled: click a tab and the selection moves. */
export const Playground: Story = {};

export const WithCounts: Story = {
  args: {
    items: [
      { value: "all", label: "Tất cả", count: 12 },
      { value: "todo", label: "Cần làm", count: 4 },
      { value: "done", label: "Đã nộp", count: 8 },
    ],
  },
};

/** Narrow container: tabs scroll sideways instead of wrapping. */
export const ManyTabs: Story = {
  args: {
    items: ["Listening", "Reading", "Writing", "Speaking", "Từ vựng", "Ngữ pháp", "Bài thi thử", "Lịch sử"].map((l) => ({ value: l, label: l })),
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};
