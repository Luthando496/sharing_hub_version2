import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  POST_COLUMNS,
  authorName,
  canWritePosts,
  formatDate,
  readingTime,
  wasUpdated,
} from "@/lib/blog";
import BlogContent from "../../components/BlogContent";
import Avatar from "../../components/Avatar";
import Thumb from "../../components/Thumb";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("title, subtitle, cover_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Post not found" };

  return {
    title: data.title,
    description: data.subtitle,
    openGraph: {
      title: data.title,
      description: data.subtitle,
      images: data.cover_image_url ? [data.cover_image_url] : [],
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (!post) notFound();

  // Show an Edit button to the author (or an admin)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let canEdit = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    canEdit =
      canWritePosts(profile?.role) &&
      (post.author_id === user.id || profile?.role === "admin");
  }

  const name = authorName(post.author);
  const published = post.published_at;

  return (
    <article className="px-5 pb-6 pt-8 sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link href="/blog" className="btn btn-sm">
            <ArrowLeft size={16} /> All posts
          </Link>
          {canEdit && (
            <Link href={`/blog/${post.slug}/edit`} className="btn btn-sun btn-sm">
              <Pencil size={16} /> Edit post
            </Link>
          )}
        </div>

        {!post.published && (
          <span className="tag mb-4 bg-sun">Draft (only you can see this)</span>
        )}

        <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-4 text-xl text-muted sm:text-2xl">{post.subtitle}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={name} src={post.author?.avatar_url} size={48} />
            <div>
              <p className="font-bold">{name}</p>
              <p className="text-sm text-muted">Author</p>
            </div>
          </div>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <div className="flex gap-1.5">
              <dt className="font-semibold text-ink">Published</dt>
              <dd>
                <time dateTime={published ?? undefined}>
                  {published ? formatDate(published) : "Not yet"}
                </time>
              </dd>
            </div>
            {published && wasUpdated(post) && (
              <div className="flex gap-1.5">
                <dt className="font-semibold text-ink">Updated</dt>
                <dd>
                  <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                </dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <dd>{readingTime(post.content)} min read</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        <Thumb
          src={post.cover_image_url}
          alt={post.title}
          className="card aspect-[16/9] w-full overflow-hidden"
        />
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <BlogContent content={post.content} />

        <div className="mt-16 flex items-center justify-between gap-4 border-t-2 border-dashed border-line/40 pt-6">
          <div className="flex items-center gap-3">
            <Avatar name={name} src={post.author?.avatar_url} size={40} />
            <p className="text-sm text-muted">
              Written by <span className="font-bold text-ink">{name}</span>
            </p>
          </div>
          <Link href="/blog" className="btn btn-sm">
            More posts
          </Link>
        </div>
      </div>
    </article>
  );
}
