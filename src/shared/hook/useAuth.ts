import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextDefinition";

/**
 * "useAuth {funcion} : hook personalizado para acceder al contexto"
 * "useContext {funcion} : hook de React que permite acceder al contexto"
 * "AuthContext {contexto} : contexto de autenticación"
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
