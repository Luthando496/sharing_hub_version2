"use client";
import { useEffect, useState } from "react";
import { User, LogOut, Book, Download, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { RESOURCE_COLUMNS, toResource } from "@/lib/resources";
import Image from "next/image";
import LoadingPage from "../resources/loading";
import Thumb from "../components/Thumb";

export default function ProfilePage() {
  const supabase = createClient();
  const route = useRouter();
  const { user, loading: authLoading } = useUser();
  const [student, setStudent] = useState(null);
  const [userResources, setUserResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      route.push("/login");
      return;
    }

    let active = true;
    (async () => {
      const [{ data: profile }, { data: rows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("resources")
          .select(RESOURCE_COLUMNS)
          .eq("author_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;

      setStudent({
        id: user.id,
        studentName: profile?.first_name || user.email?.split("@")[0] || "User",
        studentSurname: profile?.last_name || "",
        profile_image: profile?.avatar_url || "",
        module: profile?.module || "",
        bio: profile?.bio || "",
        email: user.email || "",
        join_date: profile?.created_at || user.created_at,
      });
      setUserResources((rows ?? []).map(toResource));
      setLoading(false);
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    route.push("/resources");
  };

  if (loading) {
    return <LoadingPage />;
  }

  const totalDownloads = userResources.reduce(
    (acc, resource) => acc + (resource.downloads || 0),
    0
  );

  return (
    <div className="px-5 pb-6 pt-10">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Profile card */}
        <section className="card relative overflow-hidden bg-brand p-6 text-brand-ink sm:p-10">
          <span
            aria-hidden
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-2 border-line bg-sun"
          />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-line bg-surface text-muted">
              {student?.profile_image ? (
                <Image
                  width={112}
                  height={112}
                  src={student.profile_image}
                  alt={`${student.studentName} ${student.studentSurname}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={52} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
                {student?.studentName} {student?.studentSurname}
              </h1>
              <p className="mt-1 break-all opacity-90">{student?.email}</p>
              {student?.bio && <p className="mt-3 opacity-90">{student.bio}</p>}
              {student?.module && (
                <span className="tag mt-3 bg-sun">{student.module}</span>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                {[
                  { value: userResources.length, label: "Resources" },
                  { value: totalDownloads, label: "Downloads" },
                  {
                    value: student?.join_date
                      ? new Date(student.join_date).toLocaleDateString()
                      : "N/A",
                    label: "Joined",
                  },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border-2 border-line bg-surface px-4 py-2 text-ink"
                  >
                    <div className="font-display text-xl font-extrabold">
                      {value}
                    </div>
                    <div className="text-xs text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto">
              <Link href="/profile/edit" className="btn btn-sun">
                <Pencil size={16} /> Edit profile
              </Link>
              <button onClick={handleLogout} className="btn">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </section>

        {/* Uploads */}
        <section>
          <h2 className="section-title mb-8">
            My <span className="highlight">uploads</span>
          </h2>
          {userResources.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userResources.map((resource) => (
                <article
                  key={resource.id}
                  className="card card-hover flex flex-col overflow-hidden"
                >
                  <Link href={`/resources/${resource.id}`}>
                    <Thumb
                      src={resource.image}
                      alt={resource.title}
                      className="h-44 w-full border-b-2 border-line"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm font-bold text-brand">
                      {resource.type} · {resource.category}
                    </p>
                    <h3 className="mb-2 mt-1 text-xl font-bold">
                      <Link
                        href={`/resources/${resource.id}`}
                        className="hover:underline"
                      >
                        {resource.title}
                      </Link>
                    </h3>
                    <p className="flex-1 text-sm text-muted">
                      {(resource.description || "").length > 100
                        ? `${resource.description.substring(0, 100)}...`
                        : resource.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-line/40 pt-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} />
                        {resource.uploadDate
                          ? new Date(resource.uploadDate).toLocaleDateString()
                          : "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Download size={16} />
                        {resource.downloads || 0}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card mx-auto max-w-lg p-10 text-center">
              <Book size={48} className="mx-auto text-brand" />
              <h3 className="mt-4 text-2xl font-bold">Nothing uploaded yet</h3>
              <p className="mt-2 text-muted">
                Share your first set of notes with the community.
              </p>
              <Link href="/upload-resources" className="btn btn-pop mt-6">
                Upload a resource
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
