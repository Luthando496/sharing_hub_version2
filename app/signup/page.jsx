"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useUserStore } from "@/store/store";
import AuthShell from "../components/AuthShell";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.error("Enter your name, an email, and a password of 6+ characters.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(user, {
        displayName: `${name.trim()} ${surname.trim()}`.trim(),
      });

      await setDoc(doc(db, "students", user.uid), {
        studentName: name.trim(),
        studentSurname: surname.trim(),
        profile_image: "",
        module: "",
        email: user.email,
        bio: "",
        join_date: new Date().toISOString(),
      });

      login(user);
      toast.success("Account created! Redirecting...");
      router.push("/resources");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Join the club" subtitle="Make an account to share and save study resources.">
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">First name</label>
            <input
              id="name"
              type="text"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="surname" className="label">Last name</label>
            <input
              id="surname"
              type="text"
              autoComplete="family-name"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="field"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
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

        <button type="submit" disabled={loading} className="btn btn-pop w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-brand underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
