# 🛡️ LeaseLens - AI Contract Guardian

**Upload a lease to spot red flags instantly with AI-powered analysis**

LeaseLens is an intelligent contract analysis tool that uses AI to review lease agreements, identify potential risks, and provide instant insights through an interactive chat interface.

## ✨ Features

- 📄 **Document Analysis** - Upload PDF, PNG, or JPG lease documents
- 🤖 **AI-Powered Review** - Automatic detection of red flags and risks
- 💬 **Interactive Chat** - Ask questions about your contract with Lawyer AI
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 🌓 **Dark/Light Mode** - Toggle between themes with persistent preference
- ⚡ **Real-time Processing** - Fast document analysis and chat responses

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Dropzone** - File upload handling

### Backend
- **Flask** - Python web framework
- **OpenAI API** - Document analysis and chat
- **PyPDF2** - PDF text extraction
- **Pillow** - Image processing
- **pytesseract** - OCR for images

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the Flask server:
```bash
python app.py
```

Backend runs on `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🎯 Usage

1. **Upload Document** - Drag & drop or click to upload a lease document (PDF, PNG, JPG)
2. **Analyze** - Click "Analyze Contract" to process the document
3. **Review Results** - View safety score, summary, and detected risks
4. **Ask Questions** - Use the chat interface to ask specific questions about the contract

## 📁 Project Structure

```
leaselens/
├── backend/
│   ├── uploads/          # Temporary file storage
│   ├── app.py           # Flask application
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
└── frontend/
    ├── app/
    │   ├── page.tsx    # Main application page
    │   ├── layout.tsx  # Root layout
    │   ├── globals.css # Global styles
    │   └── icon.svg    # Custom favicon
    ├── package.json    # Node dependencies
    └── next.config.ts  # Next.js configuration
```

## 🔑 Environment Variables

### Backend (.env)
```env
OPENAI_API_KEY=your_api_key_here
```

### Frontend (optional)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## 🎨 Features in Detail

### Document Analysis
- Extracts text from PDFs and images
- Generates comprehensive summaries
- Identifies potential red flags
- Provides safety ratings (0-10)

### AI Chat
- Context-aware responses
- Natural language processing
- Instant answers to contract questions
- Maintains chat history

### UI/UX
- Responsive design for all devices
- Smooth animations and transitions
- Interactive hover effects
- Custom scrollbar styling
- Theme persistence in localStorage

## 🛠️ Development

### Build for Production

Frontend:
```bash
cd frontend
npm run build
npm start
```

Backend:
```bash
cd backend
python app.py
```

## 📝 API Endpoints

### POST /analyze
Analyzes uploaded document
- **Body**: FormData with file
- **Response**: { summary, red_flags, rating, full_text }

### POST /chat
Answers questions about the contract
- **Body**: { question, context }
- **Response**: { answer }

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenAI for powerful language models
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling utilities

---

Made with ❤️ by LeaseLens Team
