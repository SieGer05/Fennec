import api from './api';

export const login = async (username, password) => {
    try {
        const { data } = await api.post('/auth/login', { username, password });
        return data;
    } catch (err) {
        const errorMsg = err.message || "Identifiants invalides";
        throw new Error(errorMsg);
    }
};