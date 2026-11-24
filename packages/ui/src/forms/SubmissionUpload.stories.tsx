import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubmissionUpload } from "./SubmissionUpload";

const meta = {
  title: "Forms/SubmissionUpload",
  component: SubmissionUpload,
  args: { maxSizeMB: 20, files: [] },
  decorators: [(Story) => <div className="max-w-lg"><Story /></div>],
} satisfies Meta<typeof SubmissionUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {};

export const WithFiles: Story = {
  args: { files: [{ name: "writing-task-2.docx", size: "1,2 MB" }, { name: "speaking-part-2.mp3", size: "4,8 MB" }] },
};

export const Uploading: Story = {
  args: { files: [{ name: "speaking-part-2.mp3", size: "4,8 MB", progress: 45 }] },
};

export const WithError: Story = {
  args: { files: [{ name: "bai-thi-thu.pdf", error: "File quá lớn." }] },
};
