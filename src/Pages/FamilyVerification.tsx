import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api";

const FamilyVerification = () => {
    const [status, setStatus] = useState(false);
    const { token } = useParams(); // Pobieramy token z URL

    const handlingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (token) {
            try {
                // Wysłanie tokenu zaproszenia do backendu w celu potwierdzenia
                const response = await api.post(
                    `/api/v1/confirm-invite/${token}/`,  // Używamy dynamicznej ścieżki
                    {  },
                    { headers: { "Content-Type": "application/json" } }
                );
                if (response.status === 200) {
                    // Ustawienie statusu po udanym potwierdzeniu zaproszenia
                    setStatus(true);
                }
            } catch (err) {
                // Obsługa błędów
                setStatus(true);
            }
        }
    };

    // Przekierowanie po pomyślnym potwierdzeniu zaproszenia
    if (status) {
        return <Navigate to="/login" />; // Możesz zmienić trasę na inną, np. dashboard
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Join to the family</h2>
                <h5 className="text-md text-center mb-4">
                    Click the button below to join to your family
                </h5>
                <form onSubmit={handlingSubmit} className="mb-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Join
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                    If you didn't receive an email, check your spam folder.
                </p>
            </div>
        </div>
    );
};

export default FamilyVerification;
