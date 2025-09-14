Doc AI
Overview
Doc AI is a secure document management system with an AI-powered semantic search. The application allows users to upload various document types (PDF, DOCX, TXT), which are then automatically categorized and summarized. For security, all documents are encrypted at rest. The system features a role-based access control model, ensuring that only authorized users can view or download specific documents. The semantic search functionality, built using Sentence Transformers and FAISS, allows users to find documents based on natural language queries rather than just keywords.

Key Features
Secure User Authentication: User registration and login using JWT for secure access.

Role-Based Access Control: Documents are accessible based on a user's assigned role (e.g., HR, Finance, Legal, Admin) and the document's category.

Document Upload & Processing: Supports PDF, DOCX, and TXT files. Documents are automatically classified and summarized on upload.

End-to-End Encryption: Documents are encrypted before being stored on the file system, and decrypted on-the-fly for viewing or downloading.

AI-Powered Semantic Search: Utilizes sentence embeddings to perform intelligent searches that understand the meaning of your query.

Audit Logging: Tracks and logs user actions such as document views, uploads, and downloads.

Installation
Prerequisites
To run this project, you need to have the following installed:

Python 3.10 or higher

pip for installing Python packages

npm for the React frontend

Backend Setup
Clone the repository:

git clone [https://github.com/mahit-shah06/hackovate-lj-cyber-rookies.git](https://github.com/mahit-shah06/hackovate-lj-cyber-rookies.git)
cd hackovate-lj-cyber-rookies/backend

Install the required Python packages:

pip install -r requirements.txt

Set the SECRET_KEY environment variable for secure JWT token generation. You can generate a random key using a tool like secrets.token_urlsafe(32):

export SECRET_KEY="your-super-secret-key-here"

Run the FastAPI application with uvicorn:

uvicorn app.main:app --reload

The backend API will be available at http://127.0.0.1:8000.

Frontend Setup
Navigate to the frontend directory:

cd ../frontend

Install the dependencies:

npm install

Start the React development server:

npm start

The application will open in your browser at http://localhost:3000.

Usage
User Authentication
Upon first access, you can register a new user with a specific role (HR, Finance, Legal, or Admin). Afterward, use the login form to authenticate and access the dashboard.

Document Management
Upload: Use the "Upload Document" button in the sidebar to add new files. The system will automatically process and encrypt them.

View: Click "View" on a document card to see its metadata, summary, and a content preview.

Download: Use the "Download" button to get the original, decrypted file.

Search
Use the search bar at the top of the dashboard to perform a semantic search. The search will return documents with the highest relevance to your query, even if the exact keywords are not present.

Project Structure
backend/

app/: Contains the core Python application files.

main.py: The main FastAPI application, handling all API endpoints.

auth_logic.py: Logic for user authentication, including JWT token creation and validation.

crud.py: Database operations for users, documents, and access logs.

db.py: Database initialization and session management.

models.py: SQLAlchemy ORM models for the database tables.

schemas.py: Pydantic models for data validation and API responses.

utils.py: Helper functions for document text extraction, metadata parsing, and summarization.

classifier.py: Document classification logic based on keywords.

uploaded_docs/: Directory where encrypted documents are stored.

frontend/: The React application.

src/App.js: The main application component with all the frontend logic.

src/index.js: The entry point for the React app.

src/index.css: Tailwind CSS configuration.

Contributing
We welcome contributions! To get started, please check the issues page for open tasks. Fork the repository, make your changes in a new branch, and submit a pull request.

License
This project is licensed under the MIT License.