# MediCore Healthcare Management System

A comprehensive healthcare management system MVP built with React, Node.js, Express, and PostgreSQL. Features role-based dashboards for hospital admins, doctors, nurses, pharmacists, and patients with secure authentication and real-time notifications.

## 🏥 Features

### Core Functionality
- **Role-based Authentication**: JWT + PIN-based two-factor authentication
- **Real-time Notifications**: WebSocket-powered live updates
- **Responsive Design**: Mobile-first, accessible UI following WCAG 2.1 guidelines
- **Secure Architecture**: HTTPS, encrypted passwords, role-based access control

### User Roles & Dashboards

#### 🔧 Hospital Admin
- User management and statistics
- Pharmacy records overview
- Doctor activity logs
- Patient records management
- System-wide oversight

#### 👨‍⚕️ Doctor
- Patient queue management
- Appointment scheduling
- Prescription creation
- Medical records access
- Real-time notifications

#### 👩‍⚕️ Nurse
- Patient registration
- Profile updates
- Diagnostics recording
- Medical record management
- Care coordination

#### 💊 Pharmacist
- Medication supply management
- Prescription verification
- Inventory tracking
- Low-stock alerts
- Sales processing

#### 🧑‍🤝‍🧑 Patient
- Appointment viewing
- Medical records access
- Symptom reporting
- Doctor consultation requests
- Health tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicore-healthcare-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb medicore
   
   # Copy environment variables
   cp .env.example .env
   
   # Update .env with your database credentials
   DATABASE_URL=postgresql://username:password@localhost:5432/medicore
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This starts both the client (http://localhost:5173) and server (http://localhost:3001) concurrently.

### Demo Credentials

| Role | Username | Password | PIN |
|------|----------|----------|-----|
| Admin | admin | admin123 | 1234 |
| Doctor | doctor1 | doctor123 | 2345 |
| Nurse | nurse1 | nurse123 | 3456 |
| Pharmacist | pharmacist1 | pharmacy123 | 4567 |

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: PostgreSQL with native driver
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Joi

### Database Schema
- **Users**: Authentication and role management
- **Patients**: Patient profiles and medical information
- **Appointments**: Scheduling and queue management
- **Prescriptions**: Medication orders and verification
- **Supplies**: Pharmacy inventory management
- **Medical Records**: Patient history and diagnostics
- **Audit Logs**: Activity tracking and compliance

## 🔒 Security Features

- **Two-Factor Authentication**: Username/password + 4-digit PIN
- **Role-Based Access Control**: Granular permissions per user role
- **Data Encryption**: Bcrypt for passwords, secure JWT tokens
- **Input Validation**: Server-side validation with Joi
- **Audit Logging**: Complete activity tracking
- **Rate Limiting**: API protection against abuse
- **HTTPS Ready**: Production security headers

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2B6CB0 (Trust, professionalism)
- **Secondary Green**: #38A169 (Health, success)
- **Accent Orange**: #F6AD55 (Attention, warnings)
- **Error Red**: #E53E3E (Alerts, critical actions)
- **Neutral Gray**: #F7FAFC (Backgrounds, subtle elements)

### Typography & Spacing
- **Font System**: System fonts with 3 weights maximum
- **Line Height**: 150% for body text, 120% for headings
- **Spacing**: 8px grid system for consistent layouts
- **Responsive**: Mobile-first breakpoints (768px, 1024px)

## 📱 Responsive Design

- **Mobile**: < 768px - Optimized for touch interactions
- **Tablet**: 768px - 1024px - Balanced layout
- **Desktop**: > 1024px - Full feature access

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## 🚀 Deployment

### Environment Variables
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t medicore .
docker run -p 3001:3001 medicore
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login with credentials + PIN
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/validate` - Validate JWT token

### User Management
- `GET /api/users` - List all users (admin only)
- `GET /api/users/stats` - User statistics and activity
- `PATCH /api/users/:id/status` - Update user status

### Patient Management
- `GET /api/patients` - List patients with search/pagination
- `POST /api/patients/register` - Register new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient profile
- `POST /api/patients/:id/diagnostics` - Add diagnostics

### Appointments
- `GET /api/appointments` - List appointments (role-filtered)
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/queue` - Doctor's patient queue

### Prescriptions
- `GET /api/prescriptions` - List prescriptions (role-filtered)
- `POST /api/prescriptions` - Create prescription (doctors only)
- `PATCH /api/prescriptions/:id/verify` - Verify prescription (pharmacists)
- `PATCH /api/prescriptions/:id/dispense` - Dispense medication

### Supplies
- `GET /api/supplies` - List medication supplies
- `POST /api/supplies` - Add/update supplies (pharmacists)
- `GET /api/supplies/stats` - Inventory statistics

## 🔧 Development

### Project Structure
```
├── server/                 # Backend application
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication & validation
│   ├── database/          # Database connection & schema
│   └── index.js          # Server entry point
├── src/                   # Frontend application
│   ├── components/        # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── pages/            # Page components
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json          # Dependencies & scripts
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety for frontend
- **Prettier**: Code formatting (recommended)
- **Husky**: Git hooks for quality checks (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the demo credentials for testing

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with external health systems
- [ ] Telemedicine features
- [ ] Advanced scheduling algorithms
- [ ] Multi-language support

---

**MediCore** - Streamlined Healthcare Management System