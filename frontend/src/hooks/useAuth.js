import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/authApi";

export function useAuth() {
    const [ isLoggedIn, setIsLoggedIn ] = useState(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });
    const navigate = useNavigate();

    const login = async (username, password) => {
            const _ = await apiLogin(username, password);

            localStorage.setItem("isLoggedIn", "true");
            setIsLoggedIn(true);

            navigate("/agents");
        }

        const logout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        navigate("/login");
    };

  return { isLoggedIn, login, logout };
}