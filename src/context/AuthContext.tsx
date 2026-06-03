import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

//  o formato do nosso user (qm é esse cara?)
type User = {
  id: string | number;
  name?: string;
  email?: string;
  role?: string; // Para sabermos depois se é "admin" ou "user"
};

// o mapa de tudo o que é guardado e feito (o que é que o app pode fazer com o user?)
type AuthContextData = {
  user: User | null;
  signIn: (userData: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

// a criacao do bau (e isto que o arquivo orcamento.tsx ta tentando importar)
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 4. protetor(da acesso ao q ta dentro)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // assim que o app abre,verifica se o user ja tava logado antes
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@Trecos3D:user');
        const storedToken = await AsyncStorage.getItem('@Trecos3D:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser)); // Devolve a informacao do user para o estado, mantendo-o logado
        }
      } catch (error) {
        console.error('Erro ao ler os cofres do telemóvel:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    loadStorageData();
  }, []);

  // Pra entrar no app (Usada no Login)
  const signIn = async (userData: User, token: string) => {
    // guarda os registos no cel
    await AsyncStorage.setItem('@Trecos3D:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@Trecos3D:token', token);
    
    // Seta o estado atual do usuário 
    setUser(userData);
  };

  // Pra sair do app (Usada no Logout)
  const signOut = async () => {
    // apaga os registos do cel
    await AsyncStorage.removeItem('@Trecos3D:user');
    await AsyncStorage.removeItem('@Trecos3D:token');
    
    // Retira o utilizador do estado atual
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};