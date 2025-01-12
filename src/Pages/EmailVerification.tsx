import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api";

const EmailVerification = () => {
    const [status, setStatus] = useState(false);
    const [error, setError] = useState(null);
    const { key } = useParams(); // Pobieramy klucz weryfikacyjny z URL

    const handlingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (key) {
            try {
                // Wysłanie klucza do backendu w celu weryfikacji emaila
                const response = await api.post(
                    "/dj-rest-auth/registration/verify-email/",
                    { key },
                    { headers: { "Content-Type": "application/json" } }
                );
                if (response.status === 200) {
                    // Ustawienie statusu po udanej weryfikacji
                    setStatus(true);
                }
            } catch (err) {
                // Obsługa błędów
                console.log(err);
            }
        }
    };

    // Przekierowanie po pomyślnej weryfikacji
    if (status) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Activate Account</h2>
                <h5 className="text-md text-center mb-4">
                    Click the button below to activate your account
                </h5>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handlingSubmit} className="mb-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                        
                    >
                        Activate Account
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                    If you didn't receive an email, check your spam folder.
                </p>
            </div>
        </div>
    );
};

export default EmailVerification;
