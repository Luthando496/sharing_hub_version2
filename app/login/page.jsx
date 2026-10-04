"use client";
import { Suspense, useEffect, useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import AuthShell from "../components/AuthShell";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  useEffect(() => {
    if (user) router.push("/resources");
  }, [user, router]);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      toast.error("Sign-in didn't complete. Please try again.");
    }
  }, [searchParams]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back! Redirecting...");
    router.push("/resources");
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // on success the browser is redirected to the provider
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
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
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="btn"
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("github")}
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

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary for static rendering
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
