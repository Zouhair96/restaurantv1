const API_URL = '/.netlify/functions/menus';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const fetchMenus = async () => {
    const response = await fetch(API_URL, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch menus');
    return response.json();
};

export const createMenu = async (name, templateType, config) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, templateType, config })
    });
    if (!response.ok) throw new Error('Failed to create menu');
    return response.json();
};

export const updateMenu = async (id, name, config) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id, name, config })
    });
    if (!response.ok) throw new Error('Failed to update menu');
    return response.json();
};

export const deleteMenu = async (id) => {
    const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete menu');
    return response.json();
};
