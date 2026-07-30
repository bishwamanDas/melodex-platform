# 🚀 MeloDex – Music Catalog Insights Platform

A full-stack web application for searching, saving, and analyzing a personal music library with AI-powered insights. The application allows users to discover music via the iTunes API, build a personal catalog, and view interactive visual analytics based on their tastes.

This project demonstrates clean architecture, secure authentication, external API integration, and a pragmatic startup-ready approach to full-stack development.

---

# 📊 Project Overview

The objective of this project is to build a robust Music Catalog Insights Platform to manage user collections and provide data-driven musical insights.

The application supports:
* Secure User login and registration
* Searching for albums via iTunes API
* Saving and managing a personal music library
* Interactive charting and analytics (Recharts)
* AI-powered Taste Profiling (Gemini)

---

# 🌐 Live Demo

You can test the live application here:
* **Frontend:** [https://melodex-platform.vercel.app](https://melodex-platform.vercel.app)
* **Backend API:** [https://melodex-backend-6vur.onrender.com](https://melodex-backend-6vur.onrender.com)

---

# ✅ Key Highlights

* 🏗️ Clean Client-Server Architecture
* 🎨 Premium dark-themed glassmorphism UI
* 🔐 JWT-based Authentication with Spring Security
* 🤖 AI Integration using Google Gemini API
* 📊 Interactive Data Visualization with Recharts
* 🗄️ Zero-friction H2 in-memory Database (PostgreSQL compatibility mode)
* 🛡️ Strict Java validation and typed Next.js interfaces

---

# 🧰 Tech Stack

## Frontend
* Next.js 15 (App Router)
* React 19
* Recharts (Analytics)
* Vanilla CSS Modules (Glassmorphism design)

## Backend
* Java 17
* Spring Boot 3.2
* Spring Security & jjwt
* H2 Database (PostgreSQL dialect)
* Maven

---

# 🔬 Project Workflow & Architecture

## 1. 🏗️ Client-Server Separation
To improve maintainability and deployment efficiency, the application is structured containing two distinct layers:
* **Frontend:** Manages the user interface, routing, charting, and authentication state.
* **Backend:** A robust REST API using Spring Boot. Controllers remain thin, routing requests directly to highly-focused Services.

## 2. 🗄️ Pragmatic Database Decision (H2 vs PostgreSQL)
While PostgreSQL is a standard choice for enterprise applications, **H2 (in PostgreSQL mode) was selected for this assessment**. This intentional choice ensures rapid, zero-friction local setup for reviewers without requiring Docker or external database installations. This perfectly aligns with the "startup-ready" mindset of focusing on functionality, speed, and developer experience first.

## 3. 🎨 UI Design & Styling
A clean, premium glassmorphism dark-themed interface was designed to improve usability and visual consistency.
* Custom CSS variables for theme consistency
* Responsive grid layout
* Micro-animations and interactive hover states

## 4. 🤖 AI Taste Profiler (Gemini)
The backend utilizes the Gemini API to analyze the user's saved catalog.
* Sends structured album metadata to Gemini.
* Generates a personalized "Music Taste Profile".
* **Mock Fallback:** If no API key is provided, a mock AI response is returned to ensure the feature remains testable for reviewers.

---

# 📉 Features Implemented

### Part 1 – Authentication
* Register and Login screens
* JWT Token generation and verification
* Protected routes

### Part 2 – Search & Library
* Real-time search via iTunes API proxy
* Save albums to personal database
* View and remove saved albums

### Part 3 – Analytics & AI
* Artist distribution pie chart
* Release year timeline chart
* AI-generated taste summary based on saved data

---

# 📁 Project Structure

```text
melodex-platform
│
├── backend
│   ├── src/main/java/com/ledgerscfo/musiccatalog
│   │   ├── controller
│   │   ├── dto
│   │   ├── model
│   │   ├── repository
│   │   ├── security
│   │   └── service
│   ├── src/main/resources
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   └── context
│   ├── public
│   └── package.json
```

---

# ▶️ Running the Project Locally

## 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

(Optional) Set Java 17:
```bash
export JAVA_HOME=/path/to/jdk-17
```

Run the server:
```bash
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*

---

## 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables (create `frontend/.env.local`):
```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the application:
```bash
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

# 🚀 Future Improvements

* Spotify API integration for audio playback
* Social features to share profiles with other users
* Pagination for large library collections
* Advanced filtering and sorting in the library view

---

# 📬 Contact

Made by Bishwaman Das
