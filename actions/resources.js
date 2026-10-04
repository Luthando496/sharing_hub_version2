"use server";

import { createClient } from "@/lib/supabase/server";
import { RESOURCE_COLUMNS, toResource } from "@/lib/resources";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// All resources, newest first
export async function fetchAllPosts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(RESOURCE_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toResource);
  } catch (error) {
    console.error("Failed to fetch all posts:", error);
    return [];
  }
}

// One resource by id (null when missing)
export async function getPostById(id) {
  try {
    const postId = Array.isArray(id) ? id[0] : id;

    if (!postId || !UUID.test(postId)) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(RESOURCE_COLUMNS)
      .eq("id", postId)
      .maybeSingle();

    if (error) throw error;
    return data ? toResource(data) : null;
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

// Up to 3 other resources in the same category
export async function getRelatedPosts(category, currentPostId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(RESOURCE_COLUMNS)
      .eq("category", category)
      .neq("id", currentPostId)
      .order("downloads", { ascending: false })
      .limit(3);

    if (error) throw error;
    return (data ?? []).map(toResource);
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
}
