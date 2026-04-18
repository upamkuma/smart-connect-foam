# Full-Stack Developer Collaboration Platform

A GitHub-like developer collaboration platform with real-time code editing, live chat, and repository management. Built with the MERN stack and Socket.io.

## Features

- **Authentication System:** JWT-based user signup, login, and protected routes.
- **Project/Repository Management:** Create, delete, and view repositories. Set them as public or private.
- **Real-Time Code Editor:** Integrated Monaco Editor with syntax highlighting and live collaboration using Socket.io.
- **Live Team Chat:** Dedicated chat rooms for each repository to communicate with collaborators in real-time.
- **Collaborator Management:** Add users to repositories with read/write access.
- **Modern UI:** Clean, dark-mode focused, responsive design built with Tailwind CSS.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite, Zustand, Monaco Editor, Lucide React
- **Backend:** Node.js, Express.js, Socket.io, JWT
- **Database:** MongoDB (Mongoose)

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB account (or local instance)

### Installation

1. Clone the repository or navigate to the project directory.

2. Install Server Dependencies:
   \`\`\`bash
   cd server
   npm install
   \`\`\`

3. Install Client Dependencies:
   \`\`\`bash
   cd ../client
   npm install
   \`\`\`

### Environment Setup

Create a \`.env\` file in the \`server\` directory based on the provided \`server/.env.example\`:

\`\`\`
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
\`\`\`

*Note: The project comes with a preconfigured \`.env\` connected to the provided MongoDB database for quick start.*

### Running the Application

You'll need two separate terminals to run both client and server concurrently.

**Terminal 1 (Backend Server):**
\`\`\`bash
cd server
node index.js
\`\`\`
*Server runs on \`http://localhost:5000\`*

**Terminal 2 (Frontend Client):**
\`\`\`bash
cd client
npm run dev
\`\`\`
*Client runs on \`http://localhost:5173\` (provided by Vite)*

## Usage

1. Open the application in your browser and click "Sign Up" to create a new profile.
2. Once logged in, use the "New Repository" button on your Dashboard.
3. Open a repository to access the Monaco Code Editor. 
4. The live chat panel on the right sidebar lets you communicate with others interacting with the same repository.
5. Code edits are automatically synced with all active sockets viewing the same file.

## Deployment Notes

- **Frontend:** Easily deployable on Vercel by pointing to the \`client\` directory.
- **Backend:** Deploy on Render (Web Service) using the \`server\` directory. Ensure Environment variables match.
- **Database:** Hosted on MongoDB Atlas.
