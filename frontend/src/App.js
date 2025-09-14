import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  FileText,
  Upload,
  Search,
  Users,
  Eye,
  Download,
  X,
  Plus,
  Book,
  Grid,
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

const roles = ['HR', 'Finance', 'Legal', 'Admin'];

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HR');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchDocuments();
    }
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    try {
      let res;
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        res = await fetch(`${API_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
          fetchUser();
        } else {
          setError(data.detail || 'Login failed.');
        }
      } else {
        const userPayload = { username, password, role };
        res = await fetch(`${API_URL}/users/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userPayload),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true);
        } else {
          setError(data.detail || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        throw new Error('Failed to fetch user data.');
      }
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/logs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setIsLogsModalOpen(true);
      } else {
        throw new Error('Failed to fetch logs.');
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/documents/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setMessage('Document uploaded successfully!');
        setFile(null);
        setIsUploadModalOpen(false);
        fetchDocuments(); // Refresh the list
      } else {
        const data = await res.json();
        setError(data.detail || 'Upload failed.');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      fetchDocuments();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search/?query=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        const data = await res.json();
        setError(data.detail || 'Search failed.');
      }
    } catch (err) {
      setError('An error occurred during search.');
    }
  };

  const handleView = async (docid) => {
    try {
      const res = await fetch(`${API_URL}/documents/${docid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data);
        setIsModalOpen(true);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to retrieve document.');
      }
    } catch (err) {
      setError('An error occurred while fetching document.');
    }
  };

  const handleDownload = async (docid) => {
    try {
      const res = await fetch(`${API_URL}/documents/${docid}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const doc = documents.find(d => d.docid === docid);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        setError(data.detail || 'Download failed.');
      }
    } catch (err) {
      setError('An error occurred during download.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setDocuments([]);
    setSelectedDoc(null);
    setLogs([]);
  };

  if (!token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <div className="bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 backdrop-blur-sm bg-opacity-70">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-white tracking-wide">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          {error && <div className="p-3 mb-4 text-sm text-red-300 bg-red-800 rounded-lg">{error}</div>}
          {message && <div className="p-3 mb-4 text-sm text-green-300 bg-green-800 rounded-lg">{message}</div>}
          <form onSubmit={handleAuth}>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <div className="mt-8 text-center text-gray-400">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-blue-400 hover:text-blue-200 transition-colors duration-300 font-medium"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 mr-8 flex-shrink-0">
        <div className="flex items-center space-x-4 mb-10">
          <Book className="text-blue-400" size={32} />
          <h1 className="text-2xl font-extrabold text-white tracking-wider">Doc AI</h1>
        </div>
        <div className="mb-8">
          <p className="text-sm text-gray-400">Logged in as:</p>
          <p className="text-xl font-bold text-white tracking-wide">{user.username}</p>
          <span className="text-sm text-blue-400 font-semibold block">{user.role}</span>
        </div>
        <nav className="space-y-4">
          <button
            onClick={() => {
              fetchDocuments();
              setSearchTerm('');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-300 group"
          >
            <Grid className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
            <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-300 group"
          >
            <Upload className="text-gray-400 group-hover:text-green-400 transition-colors" size={20} />
            <span className="font-semibold">Upload Document</span>
          </button>
          {(user.role === 'HR' || user.role === 'Admin') && (
            <button
              onClick={fetchLogs}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-300 group"
            >
              <Users className="text-gray-400 group-hover:text-purple-400 transition-colors" size={20} />
              <span className="font-semibold">Access Logs</span>
            </button>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-700 transition-colors duration-300 mt-8 group"
          >
            <LogOut className="text-gray-400 group-hover:text-white transition-colors" size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <header className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="flex-grow flex items-center bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 text-gray-200 bg-transparent outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
            >
              <Search size={20} />
            </button>
          </form>
        </header>

        {error && <div className="p-3 mb-4 text-sm text-red-300 bg-red-800 rounded-lg">{error}</div>}
        {message && <div className="p-3 mb-4 text-sm text-green-300 bg-green-800 rounded-lg">{message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.docid}
              className="relative bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-between border border-gray-700 transform hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-start space-x-4 mb-4">
                <FileText className="text-blue-400 flex-shrink-0" size={24} />
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {doc.filename}
                  </h3>
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">Category:</span> {doc.category}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-gray-400 text-sm mb-4">
                <p>
                  <span className="font-semibold text-gray-300">Author:</span> {doc.author}
                </p>
                <p>
                  <span className="font-semibold text-gray-300">Uploaded:</span> {new Date(doc.upload_date).toLocaleDateString()}
                </p>
                {doc.relevance_score && (
                  <p className="text-sm text-blue-400 font-semibold mt-1">
                    Relevance: {(doc.relevance_score * 100).toFixed(2)}%
                  </p>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleView(doc.docid)}
                  className="flex-grow flex items-center justify-center space-x-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownload(doc.docid)}
                  className="flex-grow flex items-center justify-center space-x-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-300"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-gray-500 text-center col-span-full mt-10">No documents found. Try uploading one!</p>
          )}
        </div>
      </main>

      {/* Document Details Modal */}
      {isModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">{selectedDoc.filename}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow text-gray-300">
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="font-semibold text-gray-200">Author:</span> {selectedDoc.author}
                </p>
                <p>
                  <span className="font-semibold text-gray-200">Category:</span> {selectedDoc.category}
                </p>
                <p>
                  <span className="font-semibold text-gray-200">Uploaded:</span> {new Date(selectedDoc.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-6">
                <h3 className="font-bold text-white mb-2 text-lg">Summary</h3>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-lg border border-gray-600">
                  {selectedDoc.summary}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">Content Preview</h3>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-700 p-4 rounded-lg border border-gray-600">
                  {selectedDoc.content_preview}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => handleDownload(selectedDoc.docid)}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
              >
                <Download size={20} />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Upload New Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6">
              <div className="mb-6">
                <label className="block text-gray-300 font-semibold mb-2" htmlFor="file">
                  Select File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-blue-400 hover:file:bg-gray-600 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center space-x-2 font-bold"
              >
                <Plus size={20} />
                <span>Upload</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Access Logs</h2>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow text-gray-300">
              <ul className="divide-y divide-gray-700">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <li key={log.log_id} className="py-4">
                      <p className="text-sm font-semibold text-white">
                        Action: <span className="text-blue-400">{log.action}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-300">User UUID:</span> {log.user_uuid}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-300">Document ID:</span> {log.doc_uuid || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-gray-300">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No logs found.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
