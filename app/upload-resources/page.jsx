"use client";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Camera,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/actions/upload";
import toast from "react-hot-toast";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import PageHeader from "../components/PageHeader";

const MB = 1024 * 1024;

const TIPS = [
  "Only upload content you made or have permission to share",
  "Keep documents clear and well organized",
  "Use accurate titles and descriptions so others can find your work",
  "Add a thumbnail so people can preview at a glance",
  "Documents: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (20MB max)",
  "Thumbnails: JPG, PNG, GIF (5MB max). 25MB total.",
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [type, setType] = useState("Document");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalFileSize = () => (file?.size || 0) + (thumbnailFile?.size || 0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a PDF, Word document, image, or text file"
        );
        return;
      }

      if (selectedFile.size > 20 * MB) {
        setErrorMessage("Document file size must be less than 20MB");
        return;
      }

      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage(null);

      if (selectedFile.size + (thumbnailFile?.size || 0) > 25 * MB) {
        setErrorMessage(
          "Combined file size would exceed 25MB. Please reduce file sizes."
        );
      }
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!["image/jpeg", "image/png", "image/gif"].includes(selectedFile.type)) {
        setErrorMessage(
          "Please select a JPEG, PNG, or GIF image for thumbnail"
        );
        return;
      }

      if (selectedFile.size > 5 * MB) {
        setErrorMessage("Thumbnail file size must be less than 5MB");
        return;
      }

      if ((file?.size || 0) + selectedFile.size > 25 * MB) {
        setErrorMessage(
          "Combined file size would exceed 25MB. Please reduce file sizes."
        );
        return;
      }

      setThumbnailFile(selectedFile);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setThumbnailPreview(ev.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadStatus("idle");
    setErrorMessage(null);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !user) {
      setErrorMessage(
        "Please provide a file, title, and make sure you're logged in"
      );
      return;
    }

    if (getTotalFileSize() > 25 * MB) {
      setErrorMessage(
        "Combined file size exceeds 25MB. Please reduce file sizes."
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("authorId", user.uid);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
        setUploadProgress("Uploading document and thumbnail...");
      } else {
        setUploadProgress("Uploading document...");
      }

      const result = await uploadDocument(formData);

      if (result && result.success) {
        setUploadStatus("success");
        setUploadProgress("Upload completed successfully!");
        toast.success("Resource Shared!");

        setTitle("");
        setDescription("");
        setCategory("Uncategorized");
        setType("Document");
        handleRemoveFile();
        handleRemoveThumbnail();

        setTimeout(() => {
          router.push("/resources");
        }, 2000);
      } else {
        setUploadStatus("error");
        setErrorMessage(result?.error || "Upload failed");
        setUploadProgress("");
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        "Network error. Please check your connection and try again."
      );
      setUploadProgress("");
    }

    setIsUploading(false);
  };

  const getFileIcon = () => {
    if (!file) return <FileText size={36} className="text-brand" />;
    if (file.type === "application/pdf") {
      return <FileText size={36} className="text-pop" />;
    } else if (file.type.startsWith("image/")) {
      return <FileText size={36} className="text-mint" />;
    }
    return <File size={36} className="text-sky" />;
  };

  const dropzone =
    "relative rounded-2xl border-2 border-dashed border-line bg-surface-2 p-5 text-center transition hover:-translate-y-0.5 hover:bg-surface";

  return (
    <>
      <PageHeader eyebrow="Share" title="Share your knowledge">
        Upload notes, guides or past papers to help fellow students.
      </PageHeader>

      <div className="px-5 pb-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="card p-5 sm:p-8">
            {(file || thumbnailFile) && (
              <div className="mb-6 rounded-2xl border-2 border-line bg-sky/25 p-4">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <Info size={16} /> File size summary
                </div>
                <div className="space-y-1 text-sm">
                  {file && <div>Document: {formatFileSize(file.size)}</div>}
                  {thumbnailFile && (
                    <div>Thumbnail: {formatFileSize(thumbnailFile.size)}</div>
                  )}
                  <div className="font-bold">
                    Total: {formatFileSize(getTotalFileSize())} / 25 MB
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === "success" && (
              <div
                role="status"
                className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-line bg-mint p-4 text-on-accent"
              >
                <CheckCircle />
                <div>
                  <span className="font-bold">Uploaded successfully!</span>
                  <div className="text-sm">Redirecting to resources...</div>
                </div>
              </div>
            )}
            {uploadStatus === "error" && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-line bg-pop p-4 text-on-accent"
              >
                <AlertCircle className="shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}
            {uploadStatus !== "error" && errorMessage && (
              <p role="alert" className="mb-6 font-semibold text-pop">
                {errorMessage}
              </p>
            )}
            {isUploading && uploadProgress && (
              <div
                role="status"
                className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-line bg-sun p-4 text-on-accent"
              >
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="font-semibold">{uploadProgress}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <span className="label">Document file</span>
                  <div className={dropzone}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      aria-label="Document file"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    {!file ? (
                      <div className="flex flex-col items-center py-4">
                        <Upload size={32} className="mb-2 text-brand" />
                        <p className="font-bold">Click to upload</p>
                        <p className="mt-1 text-xs text-muted">
                          PDF, Word, TXT or image (20MB max)
                        </p>
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-between gap-2 rounded-xl bg-surface p-2">
                        <div className="flex min-w-0 items-center gap-3">
                          {getFileIcon()}
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-bold">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          aria-label="Remove document"
                          className="cursor-pointer rounded-full p-1 text-pop"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="label">Thumbnail (optional)</span>
                  <div className={dropzone}>
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailChange}
                      aria-label="Thumbnail image"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      accept="image/jpeg, image/png, image/gif"
                    />
                    {!thumbnailPreview ? (
                      <div className="flex flex-col items-center py-4">
                        <Camera size={32} className="mb-2 text-pop" />
                        <p className="font-bold">Add a thumbnail</p>
                        <p className="mt-1 text-xs text-muted">
                          JPEG, PNG, GIF (5MB max)
                        </p>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="h-32 w-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          aria-label="Remove thumbnail"
                          className="absolute right-2 top-2 cursor-pointer rounded-full border-2 border-line bg-surface p-1 text-pop"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="label">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Data Structures"
                  className="field"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="A short summary of what's inside"
                  className="field"
                ></textarea>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="category" className="label">Subject</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="field"
                  >
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="History">History</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Literature">Literature</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="label">Type</label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="field"
                  >
                    <option value="Document">Document</option>
                    <option value="Notes">Notes</option>
                    <option value="Exercises">Exercises</option>
                    <option value="Study Guide">Study Guide</option>
                    <option value="Infographic">Infographic</option>
                    <option value="Reference">Reference</option>
                    <option value="Guide">Guide</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="btn btn-brand w-full text-lg"
              >
                {isUploading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Share resource
                  </>
                )}
              </button>
            </form>
          </div>

          <aside className="card h-fit -rotate-1 bg-sun p-6 text-on-accent lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-extrabold">
              Tips for a great upload
            </h2>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-3">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
