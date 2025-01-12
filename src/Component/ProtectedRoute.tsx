import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Importowanie jwtDecode
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import Cookies from "js-cookie";

// Definicja typów dla właściwości komponentu
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Uruchamiamy funkcję sprawdzającą autoryzację
    auth().catch(() => setIsAuthorized(false));
  }, []);

  // Funkcja do odświeżenia tokena
  const refreshToken = async () => {
    const refreshToken = Cookies.get(REFRESH_TOKEN); // Pobranie refresh tokena z ciasteczek
    if (!refreshToken) {
      setIsAuthorized(false);
      return;
    }

    try {
      const res = await api.post(
        "/dj-rest-auth/token/refresh/",
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200) {
        // Zapisujemy nowy access token w localStorage
        localStorage.setItem(ACCESS_TOKEN, res.data.access);

        // Aktualizujemy refresh token w ciasteczkach, jeśli jest nowy
        if (res.data.refresh) {
          Cookies.set(REFRESH_TOKEN, res.data.refresh, { expires: 7 }); // Ustawienie cookie na 7 dni
        }
        setIsAuthorized(true); 
      } else {
        setIsAuthorized(false); 
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthorized(false);
    }
  };

  // Funkcja do sprawdzania autoryzacji
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN); 
    if (!token) {
      setIsAuthorized(false); 
      return;
    }

    try {
      // Dekodowanie tokena
      const decoded: { exp?: number } = jwtDecode(token);
      const tokenExpiration = decoded.exp;

      if (!tokenExpiration) {
        setIsAuthorized(false); 
        return;
      }

      const now = Date.now() / 1000; 

      if (tokenExpiration < now) {
        await refreshToken(); 
      } else {
        setIsAuthorized(true); 
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setIsAuthorized(false); 
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
