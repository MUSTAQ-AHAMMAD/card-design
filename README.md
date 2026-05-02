# Card Design — Employee Gift Card Management System

A full-stack enterprise-grade web application for creating, managing, and sending employee gift cards with advanced design system, brand management, AI-powered content suggestions, and Outlook integration.

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (runs on port **5173**)
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite (runs on port **3001**)

## ✨ Features

### Core Features
- 🎨 **Advanced Design System** with CSS custom properties, theming support, and accessible color contrasts
- 🎁 **Gift Card Management** - Create, customize, and send digital gift cards
- 📧 **Email Scheduling** - Schedule gift cards to be sent at specific times
- 🖼️ **Template Library** - Pre-designed templates with version control
- 📊 **Analytics Dashboard** - Track usage and engagement statistics
- 👥 **User Management** - Role-based access control and permissions
- 🔒 **Enterprise Security** - Input validation, request logging, and audit trails

### New Enterprise Features
- 🏢 **Brand Management** - Manage multiple brands with logos, colors, and assets
- 👔 **Outlook Integration** - Sync employee data from Microsoft Outlook/Graph API
- 🤖 **AI-Powered Tools** - Grammar checking and content suggestions for gift card messages
- 📝 **Activity Logging** - Comprehensive audit trails for all system actions
- 🎭 **Role & Permissions** - Granular permission system with custom roles
- 📦 **Template Versioning** - Track and manage template history
- 💾 **Employee Cache** - Cache employee data for faster access
- 🎯 **Brand Assets** - Manage logos, icons, banners, and brand-specific resources

### Design System Components
- **Skeleton Loaders** - Beautiful loading states for better UX
- **Drawer Component** - Slide-in panels with accessibility features
- **Toast Notifications** - User-friendly notification system
- **Modal & Error Boundaries** - Robust error handling and UI fallbacks
- **Responsive Breakpoints** - Mobile-first responsive design

---

## Prerequisites (Windows)

Install the following tools before proceeding.

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** (includes npm) | 18 LTS or later | <https://nodejs.org/en/download> |
| **Git** | any recent version | <https://git-scm.com/download/win> |

> **Tip**: Use the default installer options for both tools. After installing, open a new **Command Prompt** or **PowerShell** window so the changes to `PATH` take effect.

Verify the installations:

```powershell
node -v
npm -v
git --version
```

---

## 1. Clone the Repository

```powershell
git clone https://github.com/MUSTAQ-AHAMMAD/card-design.git
cd card-design
```

---

## 2. Set Up the Backend

### 2a. Install dependencies

```powershell
cd backend
npm install
```

### 2b. Configure environment variables

Copy the example environment file and open it in Notepad (or any editor):

```powershell
copy .env.example .env
notepad .env
```

Update the values as needed. See the **Environment Variables** section below for details.

### 2c. Set up the database

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

These commands create the SQLite database, run all migrations, and seed it with initial data.

---

## 3. Set Up the Frontend

Open a **new** terminal window, then:

```powershell
cd card-design\frontend
npm install
```

---

## 4. Run the Application

You need **two terminal windows** running at the same time.

### Terminal 1 — Backend

```powershell
cd card-design\backend
npm run dev
```

You should see output similar to:

```
Server running on port 3001
```

### Terminal 2 — Frontend

```powershell
cd card-design\frontend
npm run dev
```

You should see output similar to:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and navigate to **<http://localhost:5173>** to use the application.

---

## 5. Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database file path |
| `JWT_SECRET` | *(change this)* | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | *(change this)* | Secret key for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Refresh token lifetime |
| `PORT` | `3001` | Port the backend listens on |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USER` | *(your email)* | SMTP login user |
| `SMTP_PASS` | *(your app password)* | SMTP login password |
| `SMTP_FROM` | *(sender address)* | "From" address in emails |

**Optional - Microsoft Graph API (for Outlook sync):**
| Variable | Description |
|----------|-------------|
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID |
| `MICROSOFT_CLIENT_ID` | Application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | Client secret value |
| `MICROSOFT_GRAPH_SCOPE` | API permissions scope (default: `https://graph.microsoft.com/.default`) |

> **Gmail tip**: Use an [App Password](https://support.google.com/accounts/answer/185833) for `SMTP_PASS` when 2-Step Verification is enabled.

For a complete guide, see [ENV_VARIABLES.md](./docs/ENV_VARIABLES.md)

---

## 6. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Brands (NEW)
- `GET /api/brands` - Get all brands with pagination
- `GET /api/brands/:id` - Get brand by ID
- `POST /api/brands` - Create new brand (Admin only)
- `PUT /api/brands/:id` - Update brand (Admin only)
- `DELETE /api/brands/:id` - Delete brand (Admin only)
- `POST /api/brands/:id/assets` - Add brand asset
- `DELETE /api/brands/:id/assets/:assetId` - Delete brand asset

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Gift Cards
- `GET /api/gift-cards` - Get all gift cards
- `GET /api/gift-cards/:id` - Get gift card by ID
- `POST /api/gift-cards` - Create new gift card
- `PUT /api/gift-cards/:id` - Update gift card
- `DELETE /api/gift-cards/:id` - Delete gift card
- `POST /api/gift-cards/:id/send` - Send gift card immediately

### Employees (NEW - Outlook Integration)
- `GET /api/employees` - Get cached employees with pagination
- `GET /api/employees/search?q=query` - Search employees
- `GET /api/employees/departments` - Get departments list
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees/sync` - Sync from Outlook (Admin only)

### AI Services (NEW)
- `POST /api/ai/grammar-check` - Check grammar and spelling
- `POST /api/ai/content-suggestions` - Generate message suggestions
- `POST /api/ai/enhance-text` - Enhance text with AI

### Email
- `GET /api/email/templates` - Get email templates
- `POST /api/email/send` - Send email

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/usage` - Get usage statistics

---

## 7. Database Schema

The application uses the following main tables:

### Core Tables
- **User** - User accounts and authentication
- **RefreshToken** - JWT refresh tokens
- **Template** - Gift card templates
- **GiftCard** - Gift card instances
- **EmailTemplate** - Email message templates
- **EmailLog** - Email sending history

### New Enterprise Tables
- **Brand** - Brand information and configuration
- **BrandAsset** - Brand-specific assets (logos, icons, etc.)
- **TemplateVersion** - Template version history
- **EmployeeCache** - Cached employee data from Outlook
- **Permission** - System permissions
- **Role** - User roles
- **RolePermission** - Role-permission mappings
- **UserRole** - User-role assignments
- **ActivityLog** - System-wide activity audit trail

---

## 8. Build for Production (Optional)

### Backend

```powershell
cd backend
npm run build
npm start
```

### Frontend

```powershell
cd frontend
npm run build
```

The compiled frontend files will be in `frontend/dist/`.

---

## 9. Design System

The application includes a comprehensive design system with:

### CSS Custom Properties
- Color palettes (primary, secondary, success, warning, error)
- Spacing scale (4px base unit system)
- Typography scale with line heights and font weights
- Border radius scale
- Shadow levels
- Z-index scale
- Transition timings
- Dark theme support

### Accessibility Features
- WCAG-compliant color contrast ratios
- Focus-visible outlines
- High contrast mode support
- Reduced motion support
- Keyboard navigation
- Screen reader friendly

### Components
- Skeleton loaders (text, avatar, card, table, form)
- Drawer (slide-in panels with focus trap)
- Toast notifications
- Modal dialogs
- Error boundaries
- Loading spinners
- Form inputs with validation

---

## 10. Security Features

### Input Validation
- Express-validator for request validation
- Sanitization of user inputs
- Type-safe TypeScript interfaces
- SQL injection prevention via Prisma ORM

### Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Permission-based authorization
- Password hashing with bcrypt

### Request Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request logging and audit trails
- Sensitive data redaction in logs

### Data Protection
- Soft deletes for data recovery
- Activity logging for audit compliance
- Input sanitization
- XSS prevention

---

## Screenshots

### Login
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Gift Cards
![Gift Cards](screenshots/gift-cards.png)

### Templates
![Templates](screenshots/templates.png)

### Create Gift Card
![Create Gift Card](screenshots/gift-card-creator.png)

### Email Templates
![Email Templates](screenshots/email-templates.png)

### Admin Panel
![Admin Panel](screenshots/admin-panel.png)

### Settings
![Settings](screenshots/settings.png)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node` or `npm` not recognised | Close and reopen the terminal after installing Node.js, or add it to `PATH` manually |
| Port 3001 / 5173 already in use | Change `PORT` in `backend/.env`, or stop the other process using that port |
| Prisma migration errors | Delete `backend/prisma/dev.db` and re-run `npm run prisma:migrate` |
| SMTP / email errors | Double-check `SMTP_USER` and `SMTP_PASS`; use a Gmail App Password if 2FA is enabled |
| TypeScript errors | Run `npm install` to ensure all dependencies are installed |
| Build failures | Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install` |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues and questions:
- Create an issue on [GitHub](https://github.com/MUSTAQ-AHAMMAD/card-design/issues)
- Contact the development team

---

**Built with ❤️ using React, TypeScript, Node.js, and modern web technologies**