# Task Management System

A full-stack task management application built with Next.js, Express.js, PostgreSQL, and Prisma. Features JWT-based authentication with refresh tokens, CRUD operations for tasks, pagination, filtering, and search functionality.

## 🚀 Features

### Authentication
- User registration and login
- JWT-based authentication with access tokens (5min expiry) and refresh tokens (7 days)
- Secure HttpOnly cookies for token storage
- Automatic token refresh on expiration
- Protected routes with middleware

### Task Management
- Create, read, update, and delete tasks
- Toggle task completion status
- Pagination support (configurable page size)
- Filter tasks by status (All, Pending, Completed)
- Global search across all tasks by title
- Real-time task statistics
- Responsive design for all screen sizes

### User Experience
- Toast notifications for all operations
- Loading states and error handling
- Modern, clean UI with Tailwind CSS
- Mobile-first responsive design
- Smooth animations and transitions

## 📁 Project Structure

```
TaskManagementSystem/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js app directory
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   └── home.tsx      # Main task management component
│   ├── lib/              # Utility libraries
│   │   └── axios.ts      # Axios instance with interceptors
│   ├── middleware.ts     # Next.js middleware for route protection
│   └── package.json
│
├── server/                # Express.js backend application
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   │   ├── Users/   # User authentication module
│   │   │   │   ├── Controller/
│   │   │   │   ├── Middlewares/
│   │   │   │   ├── Repository/
│   │   │   │   ├── Router/
│   │   │   │   └── Services/
│   │   │   └── Tasks/    # Task management module
│   │   │       ├── Controller/
│   │   │       ├── Repository/
│   │   │       ├── Router/
│   │   │       └── Services/
│   │   ├── lib/
│   │   │   └── prisma.ts # Prisma client instance
│   │   └── index.ts      # Express server entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **JWT** - Token verification in middleware

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT** - Token generation and verification
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskManagementSystem
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Set Up Environment Variables

#### Server Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your actual values (see `.env.example` for reference).

#### Client Environment Variables

Create a `.env.local` file in the `client/` directory:

```bash
cd ../client
cp .env.example .env.local
```

Edit the `.env.local` file with your actual values (see `.env.example` for reference).

### 5. Set Up Database

```bash
cd ../server/prisma

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database if you have seed data
# npx prisma db seed
```

### 6. Start the Development Servers

#### Start Backend Server

```bash
cd server
npm run dev
# Server will run on http://localhost:8000
```

#### Start Frontend Server (in a new terminal)

```bash
cd client
npm run dev
# Frontend will run on http://localhost:3000
```

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register a new user | No |
| POST | `/api/users/login` | Login user | No |
| POST | `/api/users/refreshToken` | Refresh access token | No (uses refresh token cookie) |
| POST | `/api/users/logout` | Logout user | Yes |
| GET | `/api/users/protected` | Test protected route | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (paginated) | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| GET | `/api/tasks/:id` | Get a single task | Yes |
| PUT | `/api/tasks/:id` | Update task title | Yes |
| POST | `/api/tasks/:id/toggle` | Toggle task completion | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

### Query Parameters

**GET `/api/tasks`** supports:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status: `completed`, `pending`, or omit for all
- `search` - Search tasks by title (case-insensitive)

**Example:**
```
GET /api/tasks?page=1&limit=10&status=completed&search=meeting
```

## 🔐 Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates access token (5min) and refresh token (7 days)
3. **Cookie Storage**: Tokens stored in HttpOnly cookies
4. **Request Authentication**: Access token sent with each request
5. **Token Refresh**: When access token expires, axios interceptor automatically refreshes using refresh token
6. **Logout**: Clears both token cookies

## 📱 Frontend Routes

- `/` - Home page (Task Management) - Protected
- `/login` - Login page - Public
- `/register` - Registration page - Public

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String   // Hashed with bcrypt
  task      Task[]
  createdAt DateTime @default(now())
}
```

### Task Model
```prisma
model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime @default(now())
}
```

## 🎨 Features in Detail

### Pagination
- Configurable page size (default: 10 items per page)
- Shows current page and total pages
- Previous/Next navigation
- Displays "Showing X to Y of Z tasks"

### Filtering & Search
- **Status Filter**: Filter by All, Pending, or Completed tasks
- **Global Search**: Search across all tasks by title (not just current page)
- **Debounced Search**: 500ms delay to reduce API calls
- Filters and search work together

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons and interactive elements
- Optimized spacing and typography for all screen sizes

### Toast Notifications
- Success notifications for create, update, delete, toggle operations
- Error notifications for failed operations
- Auto-dismiss after 3 seconds
- Positioned at top-right (mobile: centered)

## 🚀 Production Deployment

### Environment Variables

Ensure all environment variables are set in your production environment:

**Server:**
- `DATABASE_URL` - PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` - Strong random string for JWT access tokens
- `REFRESH_TOKEN_SECRET` - Strong random string for JWT refresh tokens
- `NODE_ENV=production`

**Client:**
- `NEXT_PUBLIC_API_URL` - Your production API URL

### Security Considerations

1. **Use HTTPS** in production
2. **Set `secure: true`** for cookies in production (already configured)
3. **Use strong secrets** for JWT tokens (at least 32 characters)
4. **Enable CORS** only for your frontend domain
5. **Use environment variables** for all sensitive data
6. **Keep dependencies updated**

### Database Migration

```bash
cd server
npx prisma migrate deploy
```

## 🧪 Testing

To test the application:

1. Register a new user at `/register`
2. Login at `/login`
3. Create tasks on the home page
4. Test filtering, searching, and pagination
5. Test toggle, edit, and delete operations

## 📝 Scripts

### Server Scripts
```bash
cd server
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Client Scripts
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js for the robust backend framework
- Prisma for the excellent ORM
- Tailwind CSS for the utility-first CSS framework

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Happy Coding! 🚀**

