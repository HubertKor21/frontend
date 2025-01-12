import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = Cookies.get(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }

        try {
            const res = await api.post("/dj-rest-auth/token/refresh/", {
                refresh: refreshToken,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                // Store the new access token in localStorage
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                // Optionally update the refresh token in case it changes
                if (res.data.refresh) {
                    Cookies.set("refresh", res.data.refresh, { expires: 7 }); // Set the cookie for 7 days (adjust as needed)
                }
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
