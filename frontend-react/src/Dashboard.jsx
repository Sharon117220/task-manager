import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  
  // NEW: State to track if we are editing an existing task
  const [editingId, setEditingId] = useState(null); 
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data.data || []);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // UPDATE EXISTING TASK
      const updated = await api.updateTask(editingId, { title, description, status });
      if (updated.success) {
        setEditingId(null); // Exit edit mode
        setTitle(''); setDescription(''); setStatus('pending');
        loadTasks();
      }
    } else {
      // CREATE NEW TASK
      const newTask = await api.createTask({ title, description, status });
      if (newTask.success) {
        setTitle(''); setDescription(''); setStatus('pending');
        loadTasks();
      }
    }
  };

  const handleEditClick = (task) => {
    // Populate the form with the task data
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.deleteTask(id);
    loadTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📝 Task Manager</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          <input 
            type="text" placeholder="Task title" required
            className="w-full px-4 py-2 border rounded-lg"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            placeholder="Description (optional)"
            className="w-full px-4 py-2 border rounded-lg resize-none"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
          <select 
            className="w-full px-4 py-2 border rounded-lg bg-white"
            value={status} onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
              {editingId ? 'Update Task' : 'Add Task'}
            </button>
            
            {/* Show Cancel button only if we are in edit mode */}
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setStatus('pending'); }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`p-4 border-l-4 rounded-lg bg-gray-50 flex justify-between items-center ${task.status === 'completed' ? 'border-green-500 opacity-60' : task.status === 'in-progress' ? 'border-yellow-500' : 'border-indigo-500'}`}>
                <div>
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className="text-xs font-semibold uppercase text-gray-500">{task.status}</span>
                </div>
                
                {/* ADDED EDIT BUTTON HERE */}
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(task)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm">
                    Delete
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}