const API_BASE = 'http://localhost:5000/api';

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  register: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  getTasks: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) throw new Error('Unauthorized');
    return res.json();
  },
  createTask: async (task) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(task),
    });
    return res.json();
  },
    updateTask: async (id, task) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(task),
    });
    return res.json();
  },
  deleteTask: async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};