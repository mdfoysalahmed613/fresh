"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface UserContextType {
   user: User | null;
   refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {

   const [user, setUser] = useState<User | null>(initialUser);
   const supabase = useMemo(() => createClient(), []);

   const refreshUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
   };

   useEffect(() => {

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         setUser(session?.user ?? null);
         if (event === 'SIGNED_OUT') {
            setUser(null);
         } else {
            // If any other event (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED) occurs
            // The subscription returns the latest session, but we also expose refreshUser
            setUser(session?.user ?? null);
         }
      });

      return () => {
         subscription.unsubscribe();
      };
   }, [supabase]);

   return (
      <UserContext.Provider value={{ user, refreshUser }}>
         {children}
      </UserContext.Provider>
   );
}

export function useUser() {
   const context = useContext(UserContext);
   if (context === undefined) {
      throw new Error("useUser must be used within a UserProvider");
   }
   return context;
}
