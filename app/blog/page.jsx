import Link from "next/link";
import { ArrowRight, Clock, PenLine, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  POST_LIST_COLUMNS,
  authorName,
  canWritePosts,
  formatDate,
} from "@/lib/blog";
import PageHeader from "../components/PageHeader";
import Thumb from "../components/Thumb";
import Avatar from "../components/Avatar";

export const metadata = {
  title: "Blog",
  description: "News, updates and stories from your SRC and class reps.",
};

function PostMeta({ post }) {
  const name = authorName(post.author);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      <span className="inline-flex items-center gap-2 font-semibold text-ink">
        <Avatar name={name} src={post.author?.avatar_url} size={28} />
        {name}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock size={14} />
        {post.published ? formatDate(post.published_at) : "Not published yet"}
      </span>
    </div>
  );
}

function DraftTag({ post }) {
  if (post.published) return null;
  return <span className="tag mb-3 bg-sun">Draft (only you can see this)</span>;
}

function FeaturedPost({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card card-hover group grid overflow-hidden md:grid-cols-2"
    >
      <Thumb
        src={post.cover_image_url}
        alt={post.title}
        className="h-64 w-full border-b-2 border-line md:h-full md:min-h-80 md:border-b-0 md:border-r-2"
      />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
        <span className="sticker self-start">Latest</span>
        <DraftTag post={post} />
        <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          {post.title}
        </h2>
        <p className="text-lg text-muted">{post.subtitle}</p>
        <PostMeta post={post} />
        <span className="inline-flex items-center gap-2 font-bold text-brand">
          Read the post
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <Thumb
        src={post.cover_image_url}
        alt={post.title}
        className="h-48 w-full border-b-2 border-line"
      />
      <div className="flex flex-1 flex-col p-5">
        <DraftTag post={post} />
        <h3 className="text-xl font-bold leading-snug">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-muted">{post.subtitle}</p>
        <div className="mt-4">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canWrite = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    canWrite = canWritePosts(profile?.role);
  }

  // The database only returns published posts, plus the viewer's own drafts.
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_COLUMNS)
    .order("published_at", { ascending: false, nullsFirst: true })
    .limit(60);
  // warn (not error) so a missing migration doesn't trigger the dev error overlay
  if (error) console.warn("Failed to load posts:", error.message);
  const posts = data ?? [];

  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader eyebrow="The blog" title="News from your student leaders">
        Updates, stories and announcements from SRC members and class reps.
      </PageHeader>

      <section className="px-5 pb-6">
        <div className="mx-auto max-w-6xl">
          {canWrite && (
            <div className="mb-8 flex justify-end">
              <Link href="/blog/new" className="btn btn-sun">
                <PenLine size={18} /> Write a post
              </Link>
            </div>
          )}

          {error ? (
            <div role="alert" className="card mx-auto max-w-lg p-10 text-center">
              <TriangleAlert size={48} className="mx-auto mb-4 text-pop" />
              <h2 className="text-2xl font-bold">The blog couldn&apos;t load</h2>
              <p className="mt-2 text-muted">Please try again in a little while.</p>
              {process.env.NODE_ENV !== "production" && (
                <p className="mt-4 rounded-xl border-2 border-line bg-surface-2 p-3 text-left text-sm">
                  <strong>Developer hint:</strong> {error.message}. If a column or table is
                  missing, run <code>supabase/blog.sql</code> in the Supabase SQL Editor.
                </p>
              )}
            </div>
          ) : posts.length === 0 ? (
            <div className="card mx-auto max-w-md p-10 text-center">
              <PenLine size={48} className="mx-auto mb-4 text-brand" />
              <h2 className="text-2xl font-bold">No posts yet</h2>
              <p className="mt-2 text-muted">
                Check back soon. Your student leaders will be posting here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <FeaturedPost post={featured} />
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
