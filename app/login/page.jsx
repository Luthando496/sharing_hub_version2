"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
import { useUserStore } from "@/store/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AuthShell from "../components/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/resources");
    });
    return () => unsubscribe();
  }, [router]);

  // Create a student document the first time someone signs in
  const createStudentDocument = async (user) => {
    try {
      const studentDocRef = doc(db, "students", user.uid);
      const studentDoc = await getDoc(studentDocRef);

      if (!studentDoc.exists()) {
        const username = user.email.split("@")[0];

        await setDoc(studentDocRef, {
          studentName: user.displayName?.split(" ")[0] || username,
          studentSurname: user.displayName?.split(" ")[1] || "",
          profile_image: user.photoURL || "",
          module: "",
          email: user.email,
          bio: "",
          join_date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error creating student document:", error);
    }
  };

  const signInWith = async (signIn) => {
    setLoading(true);
    try {
      const { user } = await signIn();
      await createStudentDocument(user);
      login(user);
      toast.success("Welcome back! Redirecting...");
      router.push("/resources");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    signInWith(() => signInWithEmailAndPassword(auth, email, password));
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to upload and track your resources.">
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="you@school.edu"
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className="field !pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-brand w-full">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-muted">
        <span className="h-0.5 flex-1 bg-line/30" />
        or
        <span className="h-0.5 flex-1 bg-line/30" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => signInWith(() => signInWithPopup(auth, new GoogleAuthProvider()))}
          disabled={loading}
          className="btn"
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => signInWith(() => signInWithPopup(auth, new GithubAuthProvider()))}
          disabled={loading}
          className="btn"
        >
          <Github size={18} /> GitHub
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-bold text-brand underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
