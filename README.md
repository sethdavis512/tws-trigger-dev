# RapiDall•E

A modern, full-stack AI-powered image generation platform built with React Router 7, BetterAuth, Trigger.dev, and Prisma.

## ✨ Features

- 🎨 **AI Image Generation** - Create stunning images with OpenAI's DALL-E 3
- 🔐 **Complete Authentication** - Secure user accounts with BetterAuth
- ⚡ **Real-time Updates** - Live task monitoring with Trigger.dev
- 💳 **Credit System** - User-based credit management for generation limits
- 🌙 **Dark Mode** - Comprehensive light/dark theme support
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🚀 **Server-Side Rendering** - Fast, SEO-friendly React Router 7
- �️ **Type-Safe Database** - Prisma ORM with PostgreSQL

## 🛠️ Tech Stack

### Frontend

- **React Router 7** - Modern SSR framework with file-based routing
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Utility-first styling with automatic dark mode
- **Lucide React** - Beautiful, customizable icons

### Backend

- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **BetterAuth** - Modern authentication with Prisma adapter
- **Trigger.dev v3** - Background task processing and monitoring

### AI & APIs

- **OpenAI DALL-E 3** - State-of-the-art image generation
- **OpenAI GPT-4o** - Enhanced prompt processing and captions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Trigger.dev account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sethdavis512/tws-trigger-dev.git
   cd tws-trigger-dev
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rapidalle"
   OPENAI_API_KEY="your_openai_api_key"
   TRIGGER_SECRET_KEY="your_trigger_secret_key"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Development

Start the development servers:

```bash
# Terminal 1: React Router dev server
npm run dev

# Terminal 2: Trigger.dev dev server  
npm run trigger:dev
```

Your application will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
├── app/
│   ├── lib/              # Auth configuration and utilities
│   ├── models/           # Database operations (Prisma)
│   ├── routes/           # Pages and API endpoints
│   │   ├── authenticated.tsx  # Protected route layout
│   │   ├── api/          # API routes
│   │   └── ...
│   ├── components/       # Reusable UI components
│   └── ...
├── trigger/
│   └── generateContent.ts    # Background image generation task
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── ...
```

## 🔐 Authentication

The app uses **BetterAuth** with email/password authentication:

- **Session-based auth** with 7-day expiry
- **Prisma adapter** for database integration
- **Layout-based protection** for authenticated routes
- **Custom user fields** including credit system

### Key Auth Files

- `app/lib/auth.server.ts` - BetterAuth server configuration
- `app/lib/auth.client.ts` - Client-side auth setup
- `app/lib/session.server.ts` - Auth helper functions
- `app/routes/authenticated.tsx` - Protected route wrapper

## 🎨 Image Generation Workflow

1. **User creates prompt** in the responsive prompt card interface
2. **Credit validation** ensures user has sufficient credits
3. **Background task** triggered via Trigger.dev for async processing
4. **Real-time updates** show generation progress to user
5. **Image persistence** saves results to database with metadata
6. **Gallery display** shows generated images in responsive grid

### Key Generation Files
- `trigger/generateContent.ts` - Main generation task
- `app/routes/api/dalle.ts` - Generation API endpoint
- `app/components/PromptCard.tsx` - Generation interface
- `app/routes/library.tsx` - Image gallery

## 🗄️ Database Schema

### Core Models
- **User** - Authentication and credits management
- **Prompt** - Reusable generation prompts
- **Image** - Generated images with metadata
- **Auth Tables** - Account, Session, Verification for BetterAuth

### Key Features
- **Cascading deletes** for data integrity
- **Credit system** with atomic operations
- **Relationship mapping** between users, prompts, and images

## 🚀 Deployment

### Environment Setup
Ensure these environment variables are set:
```env
DATABASE_URL=your_production_postgres_url
OPENAI_API_KEY=your_openai_key
TRIGGER_SECRET_KEY=your_trigger_key
```

### Build for Production
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t rapidalle .
docker run -p 3000:3000 rapidalle
```

Compatible with: AWS ECS, Google Cloud Run, Azure Container Apps, Railway, Fly.io

## 🧪 Development Commands

```bash
npm run dev          # Start React Router dev server
npm run trigger:dev  # Start Trigger.dev dev server
npm run build        # Build for production
npm run typecheck    # TypeScript validation
npx prisma studio    # Visual database browser
npx prisma migrate dev    # Apply database migrations
```

## 🎯 Key Features Deep Dive

### Credit System
- Users start with 10 free credits
- Each image generation costs 1 credit
- Atomic credit deduction prevents race conditions
- Extensible for future payment integration

### Real-time Monitoring
- Live task status updates via Trigger.dev hooks
- Progress indicators during generation
- Error handling and retry logic
- No polling - efficient WebSocket connections

### Dark Mode
- System preference detection
- Comprehensive component coverage
- Smooth transitions and proper contrast ratios
- TailwindCSS media strategy implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Router](https://reactrouter.com/) - Modern React framework
- [BetterAuth](https://better-auth.com/) - Simple, powerful authentication
- [Trigger.dev](https://trigger.dev/) - Background job processing
- [Prisma](https://prisma.io/) - Next-generation ORM
- [OpenAI](https://openai.com/) - AI-powered image generation

---

Built with ❤️ using React Router 7, BetterAuth, Trigger.dev, and Prisma.
