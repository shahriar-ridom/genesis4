# 🚀 GENESIS

<div align="center">
  <p><strong>Transform your ideas into production-ready code in seconds.</strong></p>
  <p>An AI-powered project generator that uses real-time web search to create modern, up-to-date starter templates.</p>
</div>

---

## ✨ Features

- 🤖 **AI-Powered Generation** - Leverages Google Gemini 2.5 Flash with real-time intelligence
- 🔍 **Live Web Search** - Automatically finds and uses the latest stable package versions
- 📦 **One-Click Download** - Get your complete project as a ZIP file instantly
- 🎯 **Smart Tech Stack Selection** - AI suggests optimal tech stacks or use your own
- 📝 **Complete Documentation** - Includes step-by-step setup instructions
- 💻 **Production-Ready Code** - Generate working boilerplate with best practices
- 🎨 **Modern UI** - Clean, intuitive interface with real-time feedback

## 🎬 How It Works

1. **Describe Your Idea** - Enter a description of the project you want to build
2. **Choose Your Stack** - Let AI suggest tech stacks or specify your own
3. **Generate** - AI searches the web for latest versions and generates your project
4. **Download** - Get your complete project structure with working code

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React
- **AI Model**: Google Gemini 2.5 Flash (with Google Search integration)
- **Package Management**: pnpm

## 📋 Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/genesis.git
cd genesis
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm dev
```

### 4. Configure your API key

- Click the settings icon (⚙️) in the top-right corner
- Enter your Google Gemini API key
- Your key is stored securely in your browser's local storage

## 🎯 Usage

### Basic Usage

1. Enter your project idea in the main textarea
2. Optionally specify a tech stack, or leave it blank for AI suggestions
3. Click "Generate Project"
4. Browse the generated file structure and code
5. Download as ZIP when ready

### Example Prompts

```
A real-time chat application with user authentication and message history

An e-commerce dashboard with product management and analytics

A portfolio website with blog functionality and contact form

A task management app with drag-and-drop functionality
```

## 🔧 Configuration

### API Key Storage

Genesis stores your API key locally in the browser using `localStorage`. Your key never leaves your device except to make direct API calls to Google's Gemini service.

### Customizing the Generator

You can modify the AI prompts in `App.jsx`:

- **System prompts** control how the AI generates projects
- **Search integration** can be adjusted for specific use cases

## 📁 Project Structure

```
Genesis/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component styles and animations
│   ├── index.css        # Global styles and Tailwind imports
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
└── README.md            # You are here!
```

## 🎨 Features in Detail

### Real-Time Version Checking

Genesis uses Google Search to find the absolute latest stable versions of packages, ensuring your generated projects are always up-to-date.

### Smart Tech Stack Suggestions

When you don't specify a tech stack, Genesis analyzes your project idea and suggests 3 optimized options:

- **The Speedster (MVP)** - Fastest time to market
- **The Solid Foundation** - Balanced and scalable
- **The Enterprise** - Production-grade with all features

### Interactive Code Viewer

Browse the complete generated file structure with syntax-highlighted code previews. Click any file to view its contents and copy code snippets instantly.

### Step-by-Step Setup Guide

Every generated project includes detailed setup instructions with:

- Installation commands
- Configuration steps
- Development workflow
- Deployment tips

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

<div align="center">
  <p>Made with ❤️ by developers, for developers</p>
  <p><strong>Transform ideas into reality, one project at a time.</strong></p>
</div>
