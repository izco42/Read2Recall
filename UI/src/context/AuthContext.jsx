import React, { createContext, useContext, useEffect, useState } from 'react';
import { authLogin, authLogout, loadSession, saveSession } from '../api/auth';


//se define el contenedor que almacena y comparte la informacion
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);   // { secret, ... }
  const isLogged = Boolean(session?.secret);

  useEffect(() => { setSession(loadSession()); }, []);

  const login = async (cred) => {
    const s = await authLogin(cred);
    setSession(s);
    return s;
  };

  const logout = () => {
    authLogout();
    setSession(null);
  };

   const displayName =
    session?.user?.name ||
    session?.name ||
    session?.email ||
    'Usuario';

  const value = { isLogged, session, secret: session?.secret || null, displayName, login, logout };
  //aqui se definen que valores y funciones estaran disponibles en toda la app. todo componente que este dentro del provider podra acceder a value
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
