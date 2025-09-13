let currentUser = null;
let documents = [];

// Auth Functions
function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('signupPage').style.display = 'none';
}

function showSignup() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('signupPage').style.display = 'flex';
}

function showDashboard() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('signupPage').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

function logout() {
  currentUser = null;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Simple validation (in real app, this would be server-side)
  if (username && password) {
    currentUser = { username, role: 'admin' };
    document.getElementById('userName').textContent = username;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
    showDashboard();
  } else {
    alert('Please enter valid credentials');
  }
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const role = document.getElementById('signupRole').value;

  if (username && email && role && password) {
    currentUser = { username, email, role };
    document.getElementById('userName').textContent = username;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();
    showDashboard();
  } else {
    alert('Please fill in all fields');
  }
});

// File Upload Handler
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Drag and Drop
uploadArea.addEventListener('dragover', function (e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function (e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function (e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  handleFileUpload(files);
});

fileInput.addEventListener('change', function (e) {
  const files = e.target.files;
  handleFileUpload(files);
});

function handleFileUpload(files) {
  if (files.length === 0) return;

  progressBar.style.display = 'block';
  let progress = 0;

  // Simulate upload progress
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
        alert(`Successfully uploaded ${ files.length } file(s)`);
      }, 500);
    }
    progressFill.style.width = progress + '%';
  }, 200);

  // Process each file
  Array.from(files).forEach(file => {
    console.log('Processing file:', file.name);
    // Here you would implement the actual document processing
  });
}

// Search and Filter Functions
document.getElementById('searchInput').addEventListener('input', function (e) {
  const searchTerm = e.target.value.toLowerCase();
  filterDocuments();
});

document.getElementById('categoryFilter').addEventListener('change', filterDocuments);
document.getElementById('authorFilter').addEventListener('change', filterDocuments);
document.getElementById('dateFilter').addEventListener('change', filterDocuments);

function filterDocuments() {
  // In a real application, this would filter the actual document data
  console.log('Filtering documents...');
}

// Document Detail Modal
function showDocumentDetail(docId) {
  const modal = document.getElementById('documentModal');
  const details = document.getElementById('documentDetails');

  // Sample document details
  const sampleDoc = {
    id: docId,
    title: 'Q4 Financial Report 2024',
    author: 'John Smith',
    date: 'Dec 15, 2024',
    category: 'Finance',
    summary: 'This comprehensive financial report covers the fourth quarter performance including revenue growth of 15%, expense analysis showing 8% reduction in operational costs, and profit margins improving by 12% compared to Q3.',
    entities: ['Revenue: $2.5M', 'Expenses: $1.8M', 'Profit Margin: 28%'],
    content: 'Full document content would appear here in a real implementation...'
  };

  details.innerHTML = `
                <h2>${sampleDoc.title}</h2>
                <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div><strong>Author:</strong> ${sampleDoc.author}</div>
                        <div><strong>Date:</strong> ${sampleDoc.date}</div>
                        <div><strong>Category:</strong> ${sampleDoc.category}</div>
                    </div>
                    <div><strong>Extracted Entities:</strong> ${sampleDoc.entities.join(', ')}</div>
                </div>
                <h3>Summary</h3>
                <p style="margin: 15px 0; line-height: 1.6;">${sampleDoc.summary}</p>
                <h3>Content Preview</h3>
                <p style="margin: 15px 0; padding: 20px; background: #f8fafc; border-radius: 12px; line-height: 1.6;">${sampleDoc.content}</p>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn" style="width: auto; padding: 10px 20px;">Download Original</button>
                    <button class="btn" style="width: auto; padding: 10px 20px; background: #38a169;">Export Summary</button>
                </div>
            `;

  modal.style.display = 'block';
}

function closeDocumentModal() {
  document.getElementById('documentModal').style.display = 'none';
}

// Close modal when clicking outside
document.getElementById('documentModal').addEventListener('click', function (e) {
  if (e.target === this) {
    closeDocumentModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Show login page by default
  showLogin();
});