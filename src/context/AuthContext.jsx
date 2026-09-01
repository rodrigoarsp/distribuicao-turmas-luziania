import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const DEMO_USERS = {
  tecnico: {
    id: 'usr-tecnico-01',
    nome: 'Eng. Ricardo (Técnico SME)',
    email: 'tecnico@luziania.go.gov.br',
    perfil: 'tecnico',
    escola_id: null
  },
  administrador: {
    id: 'usr-admin-01',
    nome: 'Profa. Helena (Diretora Geral SME)',
    email: 'admin@luziania.go.gov.br',
    perfil: 'administrador',
    escola_id: null
  },
  gestor: {
    id: 'usr-gestor-01',
    nome: 'Profa. Maria das Graças Silva',
    email: 'gestor.jk@luziania.go.gov.br',
    perfil: 'gestor',
    escola_id: 'e-52101894'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_auth_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.gestor;
  });

  const [activeSchoolId, setActiveSchoolId] = useState(() => {
    return localStorage.getItem('sme_luziania_active_school') || 'e-52101894';
  });

  useEffect(() => {
    localStorage.setItem('sme_luziania_auth_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_active_school', activeSchoolId);
  }, [activeSchoolId]);

  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setUser(DEMO_USERS[roleKey]);
    }
  };

  const loginWithEmail = async (email, roleKey = 'gestor') => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'Password123!'
        });
        if (!error && data.user) {
          const authUser = {
            id: data.user.id,
            nome: data.user.user_metadata?.nome || email.split('@')[0],
            email,
            perfil: data.user.user_metadata?.perfil || roleKey,
            escola_id: data.user.user_metadata?.escola_id || 'e-52101894'
          };
          setUser(authUser);
          return { success: true };
        }
      } catch (err) {
        console.warn('Erro ao conectar ao Supabase auth. Usando modo mock:', err);
      }
    }

    // Fallback Mock Login
    const demoUser = DEMO_USERS[roleKey] || DEMO_USERS.gestor;
    setUser({ ...demoUser, email: email || demoUser.email });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sme_luziania_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        activeSchoolId,
        setActiveSchoolId,
        switchRole,
        loginWithEmail,
        logout,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
