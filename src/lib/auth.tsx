import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

interface AuthContextType {
  user: any;
  profile: any;
  isDispatcher: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithVK: () => Promise<void>;
  signInWithYandex: () => Promise<void>;
  signInWithGosuslugi: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isDispatcher, setIsDispatcher] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, role:id(role)`)
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading user profile:", error);
      return;
    }

    setProfile(data);
    setIsDispatcher(data.role === "dispatcher");
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithVK = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'vk',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithYandex = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'yandex',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithGosuslugi = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'gosuslugi',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    isDispatcher,
    signIn,
    signOut,
    signInWithVK,
    signInWithYandex,
    signInWithGosuslugi,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
