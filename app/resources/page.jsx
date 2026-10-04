"use client";
import { useEffect, useState } from "react";
import { Book, Calendar, Download, Eye, Search, Upload } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetchAllPosts } from "../../actions/resources";
import LoadingPage from "./loading";
import PageHeader from "../components/PageHeader";
import { downloadUrl } from "@/lib/resources";
import Thumb from "../components/Thumb";

const categories = [
  "All",
  "Mathematics",
  "Computer Science",
  "History",
  "Chemistry",
  "Literature",
  "Physics",
];
const resourceTypes = [
  "All",
  "Notes",
  "Exercises",
  "Study Guide",
  "Infographic",
  "Reference",
  "Guide",
];

const CATEGORY_COLORS = {
  Mathematics: "bg-sun",
  "Computer Science": "bg-sky",
  History: "bg-pop",
  Chemistry: "bg-mint",
  Literature: "bg-brand !text-brand-ink",
  Physics: "bg-sun",
};

export default function ResourcesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    // allow deep links like /resources?category=History
    const wanted = new URLSearchParams(window.location.search).get("category");
    if (wanted && categories.includes(wanted)) setSelectedCategory(wanted);

    const getPosts = async () => {
      try {
        setPosts(await fetchAllPosts());
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  const handleDownload = async (resource) => {
    if (!resource.fileURL) {
      toast.error("Download URL not available");
      return;
    }

    try {
      const response = await fetch("/api/increment-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: resource.id }),
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === resource.id ? { ...p, downloads: p.downloads + 1 } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to update download count:", error);
    }

    const link = document.createElement("a");
    link.href = downloadUrl(resource.fileURL);
    link.download = resource.fileName || resource.title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingPage />;
  }

  const query = searchQuery.toLowerCase();
  const filteredResources = posts.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType = selectedType === "All" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === "popular") return b.downloads - a.downloads;
    if (sortBy === "newest")
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    return 0;
  });

  return (
    <>
      <PageHeader eyebrow="The library" title="Find your next study sidekick">
        Notes, guides and exercises shared by students. Search, filter, grab.
      </PageHeader>

      <section className="px-5">
        <div className="card mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={20}
              />
              <input
                type="search"
                aria-label="Search resources"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field !pl-12"
              />
            </div>
            <select
              aria-label="Sort resources"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="field sm:w-52"
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div>
            <p className="label">Subject</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className="chip"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Type</p>
            <div className="flex flex-wrap gap-2">
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={selectedType === type}
                  onClick={() => setSelectedType(type)}
                  className="chip"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              <span className="highlight">{sortedResources.length}</span>{" "}
              {sortedResources.length === 1 ? "resource" : "resources"} found
            </h2>
            <Link href="/upload-resources" className="btn btn-sun">
              <Upload size={18} /> Upload resource
            </Link>
          </div>

          {sortedResources.length === 0 ? (
            <div className="card mx-auto max-w-md p-10 text-center">
              <Book size={48} className="mx-auto mb-4 text-brand" />
              <h3 className="text-2xl font-bold">Nothing here yet</h3>
              <p className="mt-2 text-muted">
                Try different filters, or be the first to share something!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedResources.map((resource, i) => (
                <article
                  key={resource.id}
                  className="card card-hover pop-in flex flex-col overflow-hidden"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <Thumb
                    src={resource.image}
                    alt={resource.title}
                    className="h-48 w-full border-b-2 border-line"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {resource.category && (
                        <span
                          className={`tag ${
                            CATEGORY_COLORS[resource.category] || "bg-sun"
                          }`}
                        >
                          {resource.category}
                        </span>
                      )}
                      {resource.type && (
                        <span className="tag bg-surface-2 !text-ink">
                          {resource.type}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold leading-snug">
                      {resource.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                      {resource.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Download size={16} />
                        {resource.downloads.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={16} />
                        {resource.uploadDate
                          ? new Date(resource.uploadDate).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload(resource)}
                        className="btn btn-brand btn-sm flex-1"
                      >
                        <Download size={16} /> Download
                      </button>
                      <Link
                        href={`/resources/${resource.id}`}
                        className="btn btn-sm"
                      >
                        <Eye size={16} /> View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
