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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
          {message && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <Book className="text-blue-600" size={32} />
          <h1 className="text-3xl font-extrabold text-gray-800">
            Doc AI
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 font-medium">
            Logged in as: <span className="font-bold text-gray-800">{user.username}</span> ({user.role})
          </span>
          <button
            onClick={logout}
            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
      {message && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}

      <div className="flex items-center justify-between mb-6">
        <form onSubmit={handleSearch} className="flex-grow flex items-center bg-white rounded-lg shadow-md overflow-hidden">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-gray-800 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Search size={20} />
          </button>
        </form>

        <div className="ml-4 flex space-x-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          >
            <Upload size={20} />
            <span>Upload</span>
          </button>
          {(user.role === 'HR' || user.role === 'Admin') && (
            <button
              onClick={fetchLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
            >
              <Users size={20} />
              <span>View Logs</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.docid}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start space-x-4">
              <FileText className="text-blue-500 flex-shrink-0" size={24} />
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {doc.filename}
                </h3>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Author:</span> {doc.author}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Category:</span> {doc.category}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Uploaded:</span> {new Date(doc.upload_date).toLocaleDateString()}
                </p>
                {doc.relevance_score && (
                  <p className="text-sm text-blue-500 font-semibold mt-1">
                    Relevance: {(doc.relevance_score * 100).toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleView(doc.docid)}
                className="flex-grow flex items-center justify-center space-x-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <Eye size={16} />
                <span>View</span>
              </button>
              <button
                onClick={() => handleDownload(doc.docid)}
                className="flex-grow flex items-center justify-center space-x-1 px-4 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">No documents found. Try uploading one!</p>
        )}
      </div>

      {/* Document Details Modal */}
      {isModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{selectedDoc.filename}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-800">Author:</span> {selectedDoc.author}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Category:</span> {selectedDoc.category}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Uploaded:</span> {new Date(selectedDoc.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Summary</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedDoc.summary}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">Content Preview</h3>
                <pre className="text-gray-700 text-sm whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedDoc.content_preview}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => handleDownload(selectedDoc.docid)}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition"
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Upload New Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="file">
                  Select File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2"
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Access Logs</h2>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <ul className="divide-y divide-gray-200">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <li key={log.log_id} className="py-4">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-semibold text-gray-700">Action:</span> {log.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">User UUID:</span> {log.user_uuid}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">Document ID:</span> {log.doc_uuid || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}
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