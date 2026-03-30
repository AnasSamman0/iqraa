# محراب و كتاب (Mihrab & Kitab)
<p align="right" dir="rtl">منصة القراءة التفاعلية والمقررات التعليمية</p>

## Setup Instructions

### Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file with your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`).
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Features Complete

- **Backend Architecture**: Set up Express with comprehensive routing and JWT authentication.
- **Database Models**: MongoDB Schemas defined for `User`, `Book`, `Submission`, and `FinishedBook`.
- **Frontend Architecture**: Scalable Vite + React Setup. Total replacement of boilerplate.
- **Styling**: Complete Dark-Mode UI resembling modern Notion aesthetic. Hand-written pure CSS per requirements.
- **Routing & State**: Fully functional client-side API routing logic with `react-router-dom` and `axios`.

## Next Steps

1. Configure Google OAuth logic on the backend.
2. Build WhatsApp integration handler placeholders.
3. Finish the Books List & Detail pages on the frontend.
4. Set up an admin-only user onboarding tool on the dashboard.
