// --- CONFIGURATION ---
const API_BASE = 'http://localhost:5000/api';
const API_TASKS = `${API_BASE}/tasks`;
const API_AUTH = `${API_BASE}/auth`;

// --- DOM ELEMENTS ---
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const authForm = document.getElementById('authForm');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const submitBtn = document.getElementById('submitBtn');

// NEW DOM ELEMENTS (for Registration)
const nameInput = document.getElementById('name');
const confirmPasswordInput = document.getElementById('confirmPassword');

let isLoginMode = true;

// --- AUTH LOGIC ---
// Toggle between Login and Register
toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        // Switch to Login Mode
        authBtn.textContent = 'Login';
        toggleAuth.textContent = 'Need an account? Register';
        nameInput.style.display = 'none';
        confirmPasswordInput.style.display = 'none';
        nameInput.required = false;
        confirmPasswordInput.required = false;
    } else {
        // Switch to Register Mode
        authBtn.textContent = 'Register';
        toggleAuth.textContent = 'Have an account? Login';
        nameInput.style.display = 'block';
        confirmPasswordInput.style.display = 'block';
        nameInput.required = true;
        confirmPasswordInput.required = true;
    }
    authForm.reset();
});

// Handle Auth Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Registration Validation
    if (!isLoginMode) {
        if (password !== confirmPasswordInput.value) {
            return alert("Passwords do not match!");
        }
        if (password.length < 6) {
            return alert("Password must be at least 6 characters long.");
        }
    }

    const endpoint = isLoginMode ? '/login' : '/register';

    try {
        const res = await fetch(API_AUTH + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send name if registering (Optional: you'd need to update your DB and backend to save this)
            body: JSON.stringify({ 
                email, 
                password,
                name: isLoginMode ? undefined : nameInput.value 
            })
        });
        
        const data = await res.json();

        if (res.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                showApp();
            } else {
                alert('Registration successful! Please login.');
                
                // Automatically switch to Login mode after successful registration
                isLoginMode = true;
                authBtn.textContent = 'Login';
                toggleAuth.textContent = 'Need an account? Register';
                nameInput.style.display = 'none';
                confirmPasswordInput.style.display = 'none';
                nameInput.required = false;
                confirmPasswordInput.required = false;
                authForm.reset();
            }
        } else {
            alert(data.error || 'Authentication failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error');
    }
});

function showApp() {
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    loadTasks();
}

function logout() {
    localStorage.removeItem('token');
    appScreen.style.display = 'none';
    authScreen.style.display = 'block';
    authForm.reset();
    // Reset to login mode when logging out
    isLoginMode = true;
    authBtn.textContent = 'Login';
    toggleAuth.textContent = 'Need an account? Register';
    nameInput.style.display = 'none';
    confirmPasswordInput.style.display = 'none';
}

// Check if user is already logged in on page load
const token = localStorage.getItem('token');
if (token) showApp();

// --- TASK LOGIC ---
// Helper for headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const task = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_TASKS}/${id}` : API_TASKS;

    try {
        const res = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(task)
        });
        
        // If token expired or invalid, logout
        if (res.status === 401) return logout();

        if (res.ok) {
            taskForm.reset();
            document.getElementById('taskId').value = '';
            submitBtn.textContent = 'Add Task';
            loadTasks();
        }
    } catch (err) { console.error(err); }
});

async function loadTasks() {
    try {
        const res = await fetch(API_TASKS, { headers: getHeaders() });
        
        if (res.status === 401) return logout();

        const { data } = await res.json();
        taskList.innerHTML = data.length
            ? data.map(t => `
                <div class="task ${t.status}">
                    <div class="task-info">
                        <h3>${escapeHtml(t.title)}</h3>
                        <p>${escapeHtml(t.description || '')}</p>
                        <small>Status: ${t.status}</small>
                    </div>
                    <div class="task-actions">
                        <button class="btn-edit" data-id="${t.id}">Edit</button>
                        <button class="btn-delete" data-id="${t.id}">Delete</button>
                    </div>
                </div>
            `).join('')
            : '<p style="text-align:center;color:#888;">No tasks yet. Add one above!</p>';
            
        // Attach events
        document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', (e) => editTask(e.target.dataset.id)));
        document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', (e) => deleteTask(e.target.dataset.id)));

    } catch (err) { console.error(err); }
}

async function editTask(id) {
    try {
        const res = await fetch(`${API_TASKS}/${id}`, { headers: getHeaders() });
        const { data } = await res.json();
        document.getElementById('taskId').value = data.id;
        document.getElementById('title').value = data.title;
        document.getElementById('description').value = data.description || '';
        document.getElementById('status').value = data.status;
        submitBtn.textContent = 'Update Task';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { console.error(err); }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await fetch(`${API_TASKS}/${id}`, { method: 'DELETE', headers: getHeaders() });
        loadTasks();
    } catch (err) { console.error(err); }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}