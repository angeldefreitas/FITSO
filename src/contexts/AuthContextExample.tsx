import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserType } from '../hooks/useUserType';

// Ejemplo de cómo integrar el sistema de afiliados en tu AuthContext existente

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  // ... otros campos de usuario
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  affiliateCode?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // ... otros métodos de autenticación
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Usar el hook para determinar el tipo de usuario
  const { type, affiliateCode, isAdmin } = useUserType(user?.id);

  // Lista de emails de administradores
  const adminEmails = [
    'admin@fitso.com',
    'angel@fitso.com',
    'developer@fitso.com',
    'angelfritas@gmail.com'  // Tu email de administrador
  ];

  // Verificar si el usuario actual es admin
  const isCurrentUserAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Aquí harías tu lógica de login real
      // const response = await apiService.login(email, password);
      
      // Simulamos un login exitoso
      const mockUser: User = {
        id: 'user123',
        email: email,
        name: 'Usuario Demo',
        isVerified: true
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    // Verificar si hay un usuario logueado al iniciar la app
    // Aquí cargarías el usuario desde AsyncStorage o tu sistema de persistencia
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAdmin: isCurrentUserAdmin,
    isAffiliate: type === 'affiliate',
    affiliateCode,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Ejemplo de cómo usar el contexto en un componente
export const ExampleUsage: React.FC = () => {
  const { user, isAdmin, isAffiliate, affiliateCode } = useAuth();

  return (
    <div>
      {user && (
        <>
          <h1>Bienvenido, {user.name}!</h1>
          {isAdmin && <p>Eres administrador</p>}
          {isAffiliate && <p>Eres afiliado con código: {affiliateCode}</p>}
        </>
      )}
    </div>
  );
};
