import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Forms/SearchInput",
  component: SearchInput,
  args: { placeholder: "Tìm bài tập…", disabled: false },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithShortcut: Story = { args: { shortcut: "⌘K" } };

export const Filled: Story = { args: { defaultValue: "Writing Task 2" } };

export const Disabled: Story = { args: { disabled: true } };
