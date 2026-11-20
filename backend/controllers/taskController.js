const db = require('../config/db');

// GET all tasks FOR THE LOGGED-IN USER
exports.getAllTasks = async (req, res) => {
    try {
        // req.user.id comes from the authMiddleware
        const [rows] = await db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single task (Verify ownership)
exports.getTaskById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// CREATE task (Attach user_id)
exports.createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        
        const [result] = await db.query(
            'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
            [title, description || null, status || 'pending', req.user.id]
        );
        const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newTask[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// UPDATE task
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const [result] = await db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, status, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        
        const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE task
exports.deleteTask = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};