# CallFlow Pro - Pay Per Call Media Buying Platform

A comprehensive SaaS platform for managing pay-per-call advertising campaigns with advanced analytics, lead management, and ROI optimization.

## 🚀 Features

### Core Functionality
- **Pay-Per-Call Marketing**: Only pay for actual phone calls, not clicks or impressions
- **Campaign Management**: Create, manage, and optimize advertising campaigns
- **Advanced Analytics**: Track performance, lead quality, and ROI with detailed insights
- **Lead Qualification**: AI-powered lead scoring and qualification system
- **Real-Time Optimization**: Automatically optimize campaigns based on performance data
- **Compliance Tools**: Built-in compliance and enterprise-grade security

### User Management
- **Multi-tier Accounts**: Basic, Premium, and Enterprise plans
- **Role-based Access**: User, Manager, and Admin roles
- **Profile Management**: Customizable user profiles and preferences

### Campaign Features
- **Multiple Campaign Types**: Inbound, outbound, and hybrid campaigns
- **Targeting Options**: Demographic, geographic, and behavioral targeting
- **Budget Management**: Daily and total budget controls with real-time monitoring
- **Phone Number Management**: Toll-free, local, and vanity number support
- **Scheduling**: Flexible campaign scheduling with time zone support

### Analytics & Reporting
- **Dashboard**: Real-time performance overview
- **Call Analytics**: Detailed call tracking and quality metrics
- **Lead Analytics**: Lead quality scoring and conversion tracking
- **Geographic Insights**: Performance analysis by location
- **Export Options**: CSV and JSON data export capabilities

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Comprehensive API endpoints for all functionality
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Middleware**: Rate limiting, validation, and error handling
- **Modular Structure**: Organized routes, controllers, and services

### Frontend (React)
- **Modern UI**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first responsive design
- **State Management**: React Context for authentication and global state
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router for navigation and protected routes

### Key Technologies
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Tailwind CSS, React Router, React Query
- **Authentication**: JWT, bcryptjs
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
callflow-pro/
├── backend/                 # Backend API server
│   ├── config/             # Database and environment configuration
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── server.js       # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS configuration
├── database/               # Database scripts and migrations
├── docs/                   # Documentation
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd callflow-pro
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # The application will automatically create the database
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory, in new terminal)
   npm start
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/callflow-pro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Twilio Configuration (for call handling)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Campaign Endpoints
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Call Endpoints
- `GET /api/calls` - List calls
- `POST /api/calls` - Create call record
- `GET /api/calls/:id` - Get call details
- `PUT /api/calls/:id` - Update call
- `GET /api/calls/stats/summary` - Get call statistics

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/calls/trends` - Call trends
- `GET /api/analytics/campaigns/performance` - Campaign performance
- `GET /api/analytics/leads/quality` - Lead quality metrics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers and protection
- **Role-based Access**: Granular permission system

## 🎨 UI Components

The frontend includes a comprehensive set of reusable components:

- **Layout Components**: Navigation, sidebar, and page structure
- **Form Components**: Inputs, buttons, and form validation
- **Data Display**: Tables, cards, and data visualization
- **Navigation**: Breadcrumbs, pagination, and navigation elements
- **Feedback**: Loading states, error messages, and success notifications

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred hosting service
3. Configure MongoDB connection
4. Set up SSL certificates

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the API endpoints and examples

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication and user management
- ✅ Campaign creation and management
- ✅ Call tracking and analytics
- ✅ Basic dashboard and reporting

### Phase 2 (Next)
- 🔄 Advanced analytics and reporting
- 🔄 Lead qualification and scoring
- 🔄 Payment integration (Stripe)
- 🔄 Call recording and transcription

### Phase 3 (Future)
- 📋 AI-powered optimization
- 📋 Advanced targeting options
- 📋 Mobile application
- 📋 API marketplace and integrations

---

**CallFlow Pro** - Transform your lead generation with intelligent pay-per-call marketing.