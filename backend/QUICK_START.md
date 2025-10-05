# GrubGate Backend - Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual configuration values:
   - MongoDB connection string
   - JWT secrets
   - Email credentials (for Nodemailer)
   - Stripe keys (for payments)
   - Cloudinary credentials (for file uploads)

4. **Set up the database:**
   ```bash
   npm run setup
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Using Docker (Alternative)

1. **Start with Docker Compose:**
   ```bash
   npm run docker:up
   ```

2. **View logs:**
   ```bash
   npm run docker:logs
   ```

3. **Stop containers:**
   ```bash
   npm run docker:down
   ```

## Testing the API

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "password": "password123",
       "phoneNumber": "+1234567890",
       "role": "customer"
     }'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
├── scripts/             # Setup and utility scripts
├── .env.example         # Environment variables template
├── server.js            # Application entry point
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup` - Set up database indexes
- `npm test` - Run tests
- `npm run docker:up` - Start with Docker Compose
- `npm run docker:down` - Stop Docker containers

## API Documentation

See `API_DOCUMENTATION.md` for detailed API endpoint documentation.

## Environment Variables

Key environment variables to configure:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `CLOUDINARY_*` - Image upload configuration

## Next Steps

1. Configure your MongoDB database
2. Set up email service (Gmail, SendGrid, etc.)
3. Configure Stripe for payments
4. Set up Cloudinary for image uploads
5. Deploy to your preferred hosting platform

## Troubleshooting

**Database Connection Issues:**
- Ensure MongoDB is running
- Check your `MONGO_URI` in `.env`
- Verify network connectivity

**Authentication Issues:**
- Check `JWT_SECRET` is set
- Verify token format in requests

**File Upload Issues:**
- Verify Cloudinary credentials
- Check file size limits

For more help, check the logs or create an issue in the repository.
