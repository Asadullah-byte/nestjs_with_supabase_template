# NestJS Supabase Authentication Template

## Created & Owned by [MTalhaZulf](https://github.com/mtalhazulf)

*This template is Production Ready*

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E.svg)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.8-3ECF8E.svg)](https://supabase.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748.svg)](https://www.prisma.io/)

A production-ready NestJS template with Supabase authentication integration and Prisma ORM for database access.

## Features

- 🔐 Complete authentication flow with Supabase (signup, signin, signout, account deletion)
- 🔑 Token-based session management with specific token invalidation
- 📊 Prisma ORM integration with PostgreSQL
- 📝 Swagger API documentation
- 🔍 Comprehensive logging with Winston
- ✅ Input validation with class-validator
- 🧪 Testing setup with Jest
- 🛠️ ESLint and Prettier for code quality
- 🔄 Husky and lint-staged for pre-commit hooks

## Prerequisites

- Node.js (v16 or higher)
- bun or yarn
- PostgreSQL database (or Supabase project)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd nestjs_auth_template
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment setup

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Update the following variables in your `.env` file:

```
# Application settings
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
APP_PREFIX=NestJS-Auth

# Supabase connection
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database connection for Prisma
DATABASE_URL=your_database_url
```

### 4. Set up Supabase triggers

Execute the SQL triggers to sync Supabase Auth with your database:

```bash
npx prisma migrate dev
npx prisma db execute --file ./prisma/manual/supabase_triggers.sql --schema ./prisma/schema.prisma
```

This creates triggers that automatically:
- Create a user record in your database when a new user signs up via Supabase Auth
- Update user metadata in your database when it's updated in Supabase Auth

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start the application

```bash
# Development mode
bun run start:dev

# Production mode
bun run build
bun run start:prod
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Login with email and password
- `POST /auth/signout` - Logout (requires authentication)
- `DELETE /auth/account` - Delete user account (requires authentication)

## Project Structure

```
├── prisma/                 # Prisma schema and migrations
│   ├── manual/             # Manual SQL scripts
│   └── schema.prisma       # Prisma schema definition
├── src/
│   ├── auth/               # Authentication module
│   │   ├── docs/           # API documentation
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── user/               # User module
│   │   ├── docs/           # API documentation
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── utils/              # Utility modules
│   │   ├── common/         # Common utilities
│   │   ├── config/         # Configuration
│   │   ├── logger/         # Logging
│   │   ├── prisma/         # Prisma service
│   │   ├── supabase/       # Supabase service
│   │   ├── system/         # System utilities
│   │   └── types/          # TypeScript types
│   ├── app.module.ts       # Main application module
│   └── main.ts             # Application entry point
└── test/                   # Test files
```

## Authentication Flow

### Sign Up

1. User submits email, password, and profile information
2. The application checks if the email is already in use
3. Supabase creates a new user in Auth service
4. Database triggers automatically create a user record in the database
5. User receives a confirmation email (if enabled in Supabase)

### Sign In

1. User submits email and password
2. Supabase validates credentials and returns access and refresh tokens
3. Tokens are returned to the client for subsequent authenticated requests

### Sign Out

1. The application receives the current session token from the request headers
2. Only the specific token for the current session is invalidated
3. This prevents race conditions and allows for signing out from a specific device

### Account Deletion

1. User must be authenticated
2. The application deletes the user's data from the database
3. Supabase Auth session is terminated

## Token-Based Session Management

This template implements token-based signout to prevent race conditions and ensure specific token invalidation. When signing out, the token from the request headers is passed to the auth service and then to the Supabase service, which creates a new client with the specific token to invalidate only that session.

## Development

### Code Quality

Run linting:

```bash
bun run lint
```

Format code:

```bash
bun run format
```

### Testing

Run tests:

```bash
# Unit tests
bun run test

# Test with coverage
bun run test:cov

# E2E tests
bun run test:e2e
```

### Architecture Visualization

Generate architecture dependency graph:

```bash
bun run arch
```

## Swagger Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## License

This project is licensed under the [MIT License](LICENSE).