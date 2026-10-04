"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Book,
  Calendar,
  Download,
  FileText,
  Share,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPostById, getRelatedPosts } from "@/actions/resources";
import LoadingPage from "../loading";
import Thumb from "../../components/Thumb";

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const singlePost = await getPostById(params?.id);
        setResource(singlePost);

        if (singlePost?.category && singlePost?.id) {
          setRelatedResources(
            await getRelatedPosts(singlePost.category, singlePost.id)
          );
        }
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!resource) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5">
        <div className="card max-w-md p-10 text-center">
          <h1 className="text-3xl font-extrabold">Resource not found</h1>
          <p className="mt-2 text-muted">
            It may have been removed, or the link is off.
          </p>
          <button
            onClick={() => router.back()}
            className="btn btn-brand mt-6"
          >
            <ArrowLeft size={18} /> Go back
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!resource?.fileURL) {
      toast.error("Download URL not available");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch("/api/increment-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: resource.id }),
      });

      if (response.ok) {
        setResource((prev) =>
          prev ? { ...prev, downloads: prev.downloads + 1 } : null
        );
      } else {
        console.error("Failed to update download count");
      }

      const link = document.createElement("a");
      link.href = resource.fileURL;
      link.download = resource.fileName || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to start download");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url,
        });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const format = resource.fileName?.split(".").pop()?.toUpperCase() || "Unknown";

  return (
    <div className="px-5 pb-6 pt-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.back()}
          className="btn btn-sm mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <article className="card overflow-hidden">
              <Thumb
                src={resource.image}
                alt={resource.title}
                className="h-56 w-full border-b-2 border-line sm:h-72"
              />
              <div className="p-5 sm:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  {resource.category && (
                    <span className="tag bg-sky">{resource.category}</span>
                  )}
                  {resource.type && (
                    <span className="tag bg-sun">{resource.type}</span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
                  {resource.title}
                </h1>
                <p className="mt-4 whitespace-pre-line text-lg text-muted">
                  {resource.description || "No description provided."}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn btn-brand flex-1 text-lg"
                  >
                    {isDownloading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={20} /> Download
                      </>
                    )}
                  </button>
                  <button onClick={handleShare} className="btn btn-sun">
                    <Share size={18} /> Share
                  </button>
                </div>
              </div>
            </article>

            <section className="card p-5 sm:p-8">
              <h2 className="text-2xl font-extrabold">Details</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                {[
                  {
                    Icon: Download,
                    label: "Downloads",
                    value: resource.downloads,
                  },
                  {
                    Icon: Calendar,
                    label: "Uploaded",
                    value: formatDate(resource.uploadDate),
                  },
                  { Icon: FileText, label: "File format", value: format },
                  { Icon: Book, label: "Type", value: resource.type || "Document" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-line bg-surface-2">
                      <Icon size={20} />
                    </span>
                    <div>
                      <dt className="text-sm text-muted">{label}</dt>
                      <dd className="font-bold">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="card p-5 sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-2xl font-extrabold">Related</h2>
              {relatedResources.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {relatedResources.map((related) => (
                    <li key={related.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/resources/${related.id}`)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3 text-left transition hover:-translate-y-0.5 hover:bg-surface-2"
                      >
                        <Thumb
                          src={related.image}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-xl border-2 border-line"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-bold">
                            {related.title}
                          </span>
                          <span className="block text-xs text-muted">
                            {related.category}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                            <Download size={12} /> {related.downloads}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-muted">No related resources yet.</p>
              )}
              <button
                onClick={() => router.push("/resources")}
                className="btn btn-pop mt-6 w-full"
              >
                Browse all resources
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
