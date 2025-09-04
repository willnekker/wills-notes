import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [notes, setNotes] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(true);

  useEffect(() => {
    fetchData();
    if (user.role === 'admin') {
      fetchSignupStatus();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [notesRes, notebooksRes] = await Promise.all([
        axios.get('/api/notes', { headers }),
        axios.get('/api/notebooks', { headers })
      ]);
      
      setNotes(notesRes.data || []);
      setNotebooks(notebooksRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchSignupStatus = async () => {
    try {
      const response = await axios.get('/api/auth/signup-status');
      setSignupEnabled(response.data.signupEnabled);
    } catch (error) {
      console.error('Error fetching signup status:', error);
    }
  };

  const toggleSignup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/toggle-signup', 
        { enabled: !signupEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSignupEnabled(response.data.signupEnabled);
    } catch (error) {
      console.error('Error toggling signup:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Will's Notes</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user.username} {user.role === 'admin' && '(Admin)'}
              </p>
            </div>
            <div className="flex space-x-4">
              {user.role === 'admin' && (
                <button
                  onClick={toggleSignup}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    signupEnabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Signup: {signupEnabled ? 'Enabled' : 'Disabled'}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notebooks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Notebooks ({notebooks.length})
              </h3>
              {notebooks.length === 0 ? (
                <p className="text-gray-500 text-sm">No notebooks yet. Create your first notebook!</p>
              ) : (
                <ul className="space-y-2">
                  {notebooks.slice(0, 5).map((notebook) => (
                    <li key={notebook.id} className="border-l-4 border-blue-400 pl-3">
                      <div className="text-sm font-medium text-gray-900">{notebook.name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Notes ({notes.length})
              </h3>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">No notes yet. Start writing your first note!</p>
              ) : (
                <ul className="space-y-2">
                  {notes.slice(0, 5).map((note) => (
                    <li key={note.id} className="border-l-4 border-green-400 pl-3">
                      <div className="text-sm font-medium text-gray-900">{note.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                  Create New Note
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                  New Notebook
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium">
                  Search Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Section */}
        {user.role === 'admin' && (
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Integration Ready</h3>
              <p className="text-sm text-blue-700 mb-4">
                Your notes app is ready to integrate with the Weekly Task Manager! 
                Both apps are running and can now be connected.
              </p>
              <a 
                href="http://localhost:8081" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Open Task Manager
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;