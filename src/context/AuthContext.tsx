import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextData = {
  user: User | null;
  token: string | null;
  signIn: (userData: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@Trecos3D:user');
        const storedToken = await AsyncStorage.getItem('@Trecos3D:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Erro ao ler os cofres do telemóvel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (userData: User, token: string) => {
    await AsyncStorage.setItem('@Trecos3D:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@Trecos3D:token', token);

    setUser(userData);
    setToken(token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@Trecos3D:user');
    await AsyncStorage.removeItem('@Trecos3D:token');

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut,  isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
