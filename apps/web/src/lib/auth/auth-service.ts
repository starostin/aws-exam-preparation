import { apiClient } from '@/lib/api/client';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';

export async function signUpWithEmailPassword(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signOutCurrentUser() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function syncUserProfile(token: string) {
  return apiClient.post('/users/sync', {}, { token });
}
