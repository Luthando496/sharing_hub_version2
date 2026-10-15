"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Bold,
  Camera,
  Eye,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  PencilLine,
  Quote,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { uploadToImageKit } from "@/lib/imagekit";
import { COVER_TYPES, MAX_IMAGE_BYTES, makeSlug } from "@/lib/blog";
import { insertImage, prefixLines, wrapSelection } from "@/lib/editor";
import BlogContent from "../components/BlogContent";

const TOOLS = [
  { label: "Bold", Icon: Bold, run: (t, s, e) => wrapSelection(t, s, e, "**", "**", "bold text") },
  { label: "Italic", Icon: Italic, run: (t, s, e) => wrapSelection(t, s, e, "*", "*", "italic text") },
  { label: "Heading", Icon: Heading2, run: (t, s, e) => prefixLines(t, s, e, "## ") },
  { label: "Bulleted list", Icon: List, run: (t, s, e) => prefixLines(t, s, e, "- ") },
  { label: "Quote", Icon: Quote, run: (t, s, e) => prefixLines(t, s, e, "> ") },
  { label: "Link", Icon: Link2, run: (t, s, e) => wrapSelection(t, s, e, "[", "](https://)", "link text") },
];

export default function PostEditor({ post = null }) {
  const router = useRouter();
  const { user } = useUser();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [subtitle, setSubtitle] = useState(post?.subtitle ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [coverUrl] = useState(post?.cover_image_url ?? "");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(post?.cover_image_url ?? "");
  const [tab, setTab] = useState("write");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef(null);
  const coverInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // free the temporary preview url when it changes or the page closes
  useEffect(() => {
    return () => {
      if (coverFile && coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverFile, coverPreview]);

  const fail = (message) => {
    setError(message);
    toast.error(message);
  };

  const checkImage = (file) => {
    if (!COVER_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or GIF image.";
    if (file.size > MAX_IMAGE_BYTES) return "Images must be smaller than 5MB.";
    return null;
  };

  const chooseCover = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = checkImage(file);
    if (problem) return fail(problem);

    setError("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(post?.cover_image_url ?? "");
  };

  // Apply a toolbar action to the textarea and put the cursor back.
  const applyEdit = (result) => {
    setContent(result.text);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const runTool = (tool) => {
    const el = textareaRef.current;
    if (!el) return;
    applyEdit(tool.run(content, el.selectionStart, el.selectionEnd));
  };

  const addInlineImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    const problem = checkImage(file);
    if (problem) return fail(problem);

    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;

    setUploadingImage(true);
    try {
      const uploaded = await uploadToImageKit(file, `/blog/${user.id}`);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      applyEdit(insertImage(content, start, end, uploaded.url, alt));
      setTab("write");
      toast.success("Image added");
    } catch (err) {
      fail(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return fail("Please log in again.");
    if (!title.trim()) return fail("Add a title.");
    if (!subtitle.trim()) return fail("Add a subtitle.");
    if (!coverFile && !coverUrl) return fail("A cover image is required.");
    if (!content.trim()) return fail("Write something in the post first.");

    setSaving(true);
    try {
      const supabase = createClient();

      let cover = coverUrl;
      if (coverFile) {
        cover = (await uploadToImageKit(coverFile, `/blog/${user.id}`)).url;
      }

      const fields = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content,
        cover_image_url: cover,
        published,
      };

      let slug = post?.slug;
      if (isEdit) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(fields)
          .eq("id", post.id);
        if (updateError) throw updateError;
      } else {
        slug = makeSlug(title);
        const { error: insertError } = await supabase
          .from("posts")
          .insert({ ...fields, author_id: user.id, slug });
        if (insertError) throw insertError;
      }

      toast.success(published ? "Post published!" : "Draft saved");
      router.push(`/blog/${slug}`);
      router.refresh();
    } catch (err) {
      console.error("Saving post failed:", err);
      fail(err.message || "Couldn't save the post. Please try again.");
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isEdit || !window.confirm("Delete this post for good?")) return;
    setSaving(true);
    const { error: deleteError } = await createClient()
      .from("posts")
      .delete()
      .eq("id", post.id);
    if (deleteError) {
      setSaving(false);
      return fail(deleteError.message);
    }
    toast.success("Post deleted");
    router.push("/blog");
    router.refresh();
  };

  return (
    <form onSubmit={save} className="card space-y-6 p-5 sm:p-8" noValidate>
      {error && (
        <p role="alert" className="rounded-2xl border-2 border-line bg-pop p-4 font-semibold text-on-accent">
          {error}
        </p>
      )}

      {/* Cover image (required) */}
      <div>
        <span className="label">
          Cover image <span className="text-pop">*</span>
        </span>
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface-2">
          {coverPreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="Cover preview" className="h-56 w-full object-cover sm:h-72" />
              {coverFile && (
                <button
                  type="button"
                  onClick={removeCover}
                  aria-label="Remove new cover image"
                  className="absolute right-3 top-3 cursor-pointer rounded-full border-2 border-line bg-surface p-1.5"
                >
                  <X size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="grid h-40 place-items-center text-center text-muted">
              <div>
                <Camera size={32} className="mx-auto mb-2 text-pop" />
                <p className="font-bold text-ink">Add a cover image</p>
                <p className="text-xs">JPG, PNG, WebP or GIF, up to 5MB</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept={COVER_TYPES.join(",")}
          onChange={chooseCover}
          aria-label="Cover image"
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="btn btn-sm mt-3"
        >
          <Camera size={16} /> {coverPreview ? "Change cover" : "Choose cover"}
        </button>
      </div>

      <div>
        <label htmlFor="title" className="label">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="A headline people will want to click"
          className="field text-xl font-bold"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className="label">Subtitle</label>
        <input
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          maxLength={220}
          placeholder="One line that says what the post is about"
          className="field"
        />
      </div>

      {/* Content */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="content" className="label !mb-0">Content</label>
          <div role="tablist" aria-label="Editor mode" className="inline-flex rounded-full border-2 border-line bg-surface-2 p-0.5">
            {[
              { id: "write", label: "Write", Icon: PencilLine },
              { id: "preview", label: "Preview", Icon: Eye },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                  tab === id ? "bg-brand text-brand-ink" : ""
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "write" ? (
          <>
            <div className="mb-2 flex flex-wrap gap-2" role="toolbar" aria-label="Formatting">
              {TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={() => runTool(tool)}
                  aria-label={tool.label}
                  title={tool.label}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface hover:bg-surface-2"
                >
                  <tool.Icon size={16} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn btn-sm"
              >
                <ImagePlus size={16} /> {uploadingImage ? "Uploading..." : "Add image"}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept={COVER_TYPES.join(",")}
                onChange={addInlineImage}
                aria-label="Add image to content"
                className="sr-only"
              />
            </div>
            <textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder={"Start writing...\n\nPress Enter twice to start a new paragraph."}
              className="field min-h-72 leading-relaxed"
            />
            <p className="mt-2 text-sm text-muted">
              Leave a blank line between paragraphs. Images are optional.
            </p>
          </>
        ) : (
          <div className="min-h-72 rounded-2xl border-2 border-line bg-surface p-5">
            {content.trim() ? (
              <BlogContent content={content} />
            ) : (
              <p className="text-muted">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-surface-2 p-4">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-5 w-5 accent-[var(--brand)]"
        />
        <span>
          <span className="block font-bold">Publish this post</span>
          <span className="block text-sm text-muted">
            Leave unticked to keep it as a draft only you can see.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {isEdit ? (
          <button type="button" onClick={remove} disabled={saving} className="btn btn-pop">
            <Trash2 size={16} /> Delete post
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={saving || uploadingImage} className="btn btn-brand text-lg">
          {saving ? "Saving..." : isEdit ? "Save changes" : published ? "Publish post" : "Save draft"}
        </button>
      </div>
    </form>
  );
}
