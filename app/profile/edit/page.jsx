"use client";
import { useEffect, useState } from "react";
import { User, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/store";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import toast from "react-hot-toast";
import LoadingPage from "../../resources/loading";
import PageHeader from "../../components/PageHeader";

// Only these fields can be changed from this form
const EDITABLE = ["studentName", "studentSurname", "module", "bio"];

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    bio: "",
    email: "",
    module: "",
    profile_image: "",
    studentName: "",
    studentSurname: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { logout } = useUserStore((state) => state);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchStudentData(currentUser.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStudentData = async (uid) => {
    try {
      const studentDoc = await getDoc(doc(db, "students", uid));
      if (studentDoc.exists()) {
        setFormData((prev) => ({ ...prev, ...studentDoc.data() }));
      } else {
        toast.error("Profile not found. Please log in again.");
        logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load profile data.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const updates = Object.fromEntries(
          EDITABLE.map((key) => [key, formData[key] ?? ""])
        );
        await updateDoc(doc(db, "students", user.uid), updates);
        toast.success("Profile updated!");
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageHeader eyebrow="Profile" title="Edit your profile" />
      <div className="px-5 pb-6">
        <div className="card mx-auto max-w-3xl p-5 sm:p-10">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-line bg-surface-2 text-muted">
                {formData.profile_image ? (
                  <Image
                    width={112}
                    height={112}
                    src={formData.profile_image}
                    alt={`${formData.studentName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={56} />
                )}
              </div>
              <p className="text-sm text-muted">
                Your photo comes from your Google or GitHub login.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="studentName" className="label">First name</label>
                <input
                  type="text"
                  name="studentName"
                  id="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="studentSurname" className="label">Last name</label>
                <input
                  type="text"
                  name="studentSurname"
                  id="studentSurname"
                  value={formData.studentSurname}
                  onChange={handleInputChange}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  readOnly
                  className="field"
                />
                <p className="mt-1 text-xs text-muted">Email can&apos;t be changed here.</p>
              </div>
              <div>
                <label htmlFor="module" className="label">Module</label>
                <input
                  type="text"
                  name="module"
                  id="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="label">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleInputChange}
                className="field"
              ></textarea>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="btn"
              >
                <X size={18} /> Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn btn-brand">
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
