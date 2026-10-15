"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useRole } from "@/lib/supabase/useRole";
import LoadingPage from "../resources/loading";

// Only shows its children to signed-in authors/admins.
export default function WriterGate({ children }) {
  const router = useRouter();
  const { user, loading, canWrite } = useRole();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return <LoadingPage />;

  if (!canWrite) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5">
        <div className="card max-w-md p-10 text-center">
          <Lock size={44} className="mx-auto mb-4 text-brand" />
          <h1 className="text-3xl font-extrabold">Authors only</h1>
          <p className="mt-2 text-muted">
            Blog posts are written by SRC members and class reps. If that&apos;s you,
            ask an admin to give your account author access.
          </p>
          <Link href="/blog" className="btn btn-brand mt-6">
            Read the blog
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
