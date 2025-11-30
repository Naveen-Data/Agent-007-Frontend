# Mr Agent 007 Frontend

🎨 Modern React TypeScript frontend for the Mr Agent 007 AI chatbot with Material-UI design.

## 🚀 Quick Deployment

**Backend deployed on EC2? Deploy your frontend now!**

```bash
./scripts/setup-github-secrets.sh
git push origin main
```

📖 **See [QUICK_START.md](./QUICK_START.md) for step-by-step deployment guide**
📚 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed documentation**

---

## Features

- 🎨 Modern Material-UI interface
- 💬 Real-time chat with the backend
- 🔧 Multiple agent modes (RAG, Tools, Heavy)
- 🟢 Connection status indicator
- 📱 Responsive design
- ☁️ Deployed on AWS S3 + CloudFront
- 🔄 Automated CI/CD with GitHub Actions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend running on http://localhost:8000

## Installation

1. **Install Node.js** (if not already installed):
   - Visit [nodejs.org](https://nodejs.org/) and download the latest LTS version
   - Or use Homebrew: `brew install node`

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Ensure backend is running** on http://localhost:8000
2. **Select a mode** from the dropdown:
   - **RAG Mode**: Uses retrieval-augmented generation
   - **Tools Mode**: Can make HTTP calls and use tools
   - **Heavy Mode**: Uses the heavy Gemini model
3. **Type your message** and press Enter or click Send
4. **View responses** from the AI agent

## API Endpoints Used

- `GET /health` - Check backend connectivity
- `POST /api/chat` - Send messages to the chatbot

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ChatInterface.tsx    # Main chat UI component
│   ├── services/
│   │   └── api.ts              # Backend API integration
│   ├── App.tsx                 # Main app component with theme
│   ├── index.tsx               # React entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on http://localhost:8000
- Check the connection status indicator in the top right
- Click the refresh icon to test connectivity

### Installation Issues
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again
- Check for any firewall or proxy issues

### Port Conflicts
- If port 3000 is busy, React will automatically suggest another port
- You can set a custom port: `PORT=3001 npm start`# Updated API configuration Sun Nov 30 13:24:36 IST 2025
