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
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            throw new Error("⚠️ STOP! You are testing on LOCALHOST. The login will ONLY work on the deployed NETLIFY website. Please open your site on Netlify (e.g. https://your-site.netlify.app).");
        }
        throw new Error("Backend not connected. Application/JSON expected but got HTML.");
    }

    const data = await response.json();
    if (!response.ok) {
        const message = data.details ? `${data.error}: ${data.details}` : (data.error || 'Login failed');
        throw new Error(message);
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
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            throw new Error("⚠️ STOP! You are testing on LOCALHOST. The login will ONLY work on the deployed NETLIFY website. Please open your site on Netlify (e.g. https://your-site.netlify.app).");
        }
        throw new Error("Backend not connected. Application/JSON expected but got HTML.");
    }

    const data = await response.json();
    if (!response.ok) {
        const message = data.details ? `${data.error}: ${data.details}` : (data.error || 'Signup failed');
        throw new Error(message);
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

export const subscribeUser = async (plan, paymentMethod) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan, paymentMethod }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
    }

    // Update local user data
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};
