# Linkedin-Inspired Platform

A LinkedIn-inspired full-stack web app that helps users connect professionally, share updates, and grow their network. Built with the  **`` MERN stack (MongoDB, Express, React, Node.js) ``**, styled using  **`` Tailwind CSS ``**, and powered by  **`` TanStack React Query ``** for data fetching and caching.

Deployed on  **`` Render ``** with a production-ready build that serves both backend API and frontend from a single Node.js server.

### 🌐 [*View Live*](https://linkedin-zmzv.onrender.com)

---

## 🚀 `` Features ``

- 🔐 **Authentication**: Sign up, login, logout with JWT-based auth
- 🧑‍🤝‍🧑 **Connections**: Send, accept, reject, and remove connection requests
- 📰 **Feed**: Create posts, like, and comment
- 🔔 **Notifications**: In-app alerts for user activity
- 🧠 **Suggestions**: Smart suggestions for connecting with new people
- 🌐 **User Profiles**: View and update profile info
- 📸 **Image Upload**: Integrated with Cloudinary for media storage
- 📧 **Emails**: Email functionality powered by Brevo

---

## 🧱 `` Tech Stack ``

### Backend
- **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Cloudinary** for image uploads
- **Brevo (Sendinblue)** via sib-api-v3-sdk for transactional emails
- **bcryptjs**, **cookie-parser**, **cors**, **dotenv**

### Frontend
- **React**
- **Tailwind CSS**
- **React Router DOM**
- **TanStack React Query**
- **Axios**
- **React Hot Toast**
- **Lucide React**
- **date-fns** for date formatting

---

## 🌍 `` Deployment ``

The entire application is deployed on **Render** using a single **Web Service**.

- 🔧 **Backend (Express + API)** and **Frontend (React)** are bundled together.
- React is built into static files and served by Express from the `/frontend/dist` folder in production.

 You’ll also need:
- MongoDB Atlas for your database
- Cloudinary account for media storage
- Brevo API key for email services

### 📦 Deployment Setup on Render

1. **Create a Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Use the following settings:
   - **Build Command:**  
     ```bash
     npm run build
     ```
   - **Start Command:**  
     ```bash
     npm run start
     ```
   - **Environment:** Node
4. Add the necessary environment variables (see below)
5. Done! Render will automatically serve both the **API** and **frontend** from one place.

---

### 🔐`` Required Environment Variables ``

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_email@example.com
BREVO_SENDER_NAME=LinkedIn Clone

# Set this depending on your environment:
# development
CLIENT_URL=http://localhost:5173

# production
# CLIENT_URL=https://your-production-url.onrender.com

# Only needed during development
NODE_ENV=development
```

> 📝 **Note**: Only one `CLIENT_URL` should be active at a time.  

---

## 🛠 `` Installation (Development) ``

```bash
# Clone the repo
git clone https://github.com/Manish-Singh-Ranawat/LinkedIn
cd LinkedIn

# Backend setup
cd backend
npm install
# Create a .env file manually and add your environment variables
npm run dev

# Frontend setup
cd ../frontend
npm install
npm run dev
```
