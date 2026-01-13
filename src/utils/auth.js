const API_URL = '/.netlify/functions';

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend not connected. (If testing locally, functions won't work without 'netlify dev').");
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};

export const signupUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth-signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend not connected. (If testing locally, functions won't work without 'netlify dev').");
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
    }

    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
