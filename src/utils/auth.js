const API_URL = '/api';

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

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

export const loginStaff = async (restaurantId, pin) => {
    const response = await fetch(`${API_URL}/auth-staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, pin }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Staff login failed');
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
        const text = await response.text();
        console.error("Backend returned non-JSON response:", text);
        throw new Error(`Backend error (${response.status}): Expected JSON but got ${contentType || 'text'}. Please ensure 'npm start' is running on the correct port.`);
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

export const unsubscribeUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/unsubscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Unsubscription failed');
    }

    // Update local user data
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};

export const updateUserProfile = async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/update-profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
    }

    // Update local user data
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};
