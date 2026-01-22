import { createContext} from 'react';
import { AuthContextType } from '../types/auth.types';

/**
 * createContext {funcion} : crea un contexto de datos que puede ser accedido por cualquier componente
 * AuthContextType {interface} : define el tipo de datos que se van a pasar en el contexto
 * undefined {valor} : valor por defecto del contexto
*/
export const AuthContext = createContext<AuthContextType | undefined>(undefined);