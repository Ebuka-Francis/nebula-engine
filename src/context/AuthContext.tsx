'use client';

import {
   createContext,
   useContext,
   useEffect,
   useState,
   ReactNode,
} from 'react';

import {
   User,
   onAuthStateChanged,
   signOut,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

interface AuthContextType {
   user: User | null;
   loading: boolean;
   isAuthenticated: boolean;
   logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
   undefined
);

interface AuthProviderProps {
   children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(
         auth,
         (currentUser) => {
            setUser(currentUser);
            setLoading(false);
         }
      );

      return () => unsubscribe();
   }, []);

   const logout = async () => {
      try {
         await signOut(auth);
      } catch (error) {
         console.error('Logout failed:', error);
         throw error;
      }
   };

   const isAuthenticated = Boolean(user);

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
            isAuthenticated,
            logout,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const context = useContext(AuthContext);

   if (!context) {
      throw new Error(
         'useAuth must be used inside an AuthProvider'
      );
   }

   return context;
}