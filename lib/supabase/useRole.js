"use client";
import { useEffect, useState } from "react";
import { createClient } from "./client";
import { useUser } from "./useUser";
import { canWritePosts } from "@/lib/blog";

// The signed-in user's role ("student" | "author" | "admin") and whether they can write posts.
export function useRole() {
  const { user, loading: authLoading } = useUser();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    let active = true;
    createClient()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setRole(data?.role ?? "student");
        setRoleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return {
    user,
    role,
    loading: authLoading || roleLoading,
    canWrite: canWritePosts(role),
    isAdmin: role === "admin",
  };
}
