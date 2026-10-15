"use client";
import PageHeader from "../../components/PageHeader";
import PostEditor from "../PostEditor";
import WriterGate from "../WriterGate";

export default function NewPostPage() {
  return (
    <WriterGate>
      <PageHeader eyebrow="Blog" title="Write a new post">
        Share news, updates and stories with the whole student body.
      </PageHeader>
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-3xl">
          <PostEditor />
        </div>
      </div>
    </WriterGate>
  );
}
