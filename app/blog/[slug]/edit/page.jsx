"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/lib/supabase/useRole";
import PageHeader from "../../../components/PageHeader";
import LoadingPage from "../../../resources/loading";
import PostEditor from "../../PostEditor";
import WriterGate from "../../WriterGate";

function EditPost() {
  const { slug } = useParams();
  const { user, isAdmin } = useRole();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    createClient()
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setPost(data);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <LoadingPage />;

  const allowed = post && (post.author_id === user?.id || isAdmin);
  if (!allowed) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5">
        <div className="card max-w-md p-10 text-center">
          <h1 className="text-3xl font-extrabold">
            {post ? "That's not your post" : "Post not found"}
          </h1>
          <p className="mt-2 text-muted">
            {post ? "You can only edit posts you wrote." : "It may have been deleted."}
          </p>
          <Link href="/blog" className="btn btn-brand mt-6">
            Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Blog" title="Edit post" />
      <div className="px-5 pb-6">
        <div className="mx-auto max-w-3xl">
          <PostEditor post={post} />
        </div>
      </div>
    </>
  );
}

export default function EditPostPage() {
  return (
    <WriterGate>
      <EditPost />
    </WriterGate>
  );
}
