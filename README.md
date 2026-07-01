# Sriganesh K C - Developer Portfolio

A modern, high-end, responsive developer portfolio featuring a dark tech aesthetic, custom neon glows (cyan/purple), glassmorphism, dynamic animations, and an authenticated admin dashboard for direct content editing.

## Features

- **Dynamic Homepage**: High-performance rendering of experience, projects, skills, education, and achievements fetched dynamically from `data.json`.
- **Fluid Morphing Profile Picture**: Premium profile photo container with smooth organic morphing and rotating dashed accent border.
- **GitHub Integration**: Dynamically fetches your latest public repositories from GitHub.
- **Resume Download**: Dynamic link in the Hero section pointing directly to your resume (Google Drive, local file, etc.).
- **Admin Dashboard**: Full-featured admin panel at `/admin.html` to modify your portfolio content on the fly.
- **Secure Administration**: Authentication mechanism protecting the admin dashboard from unauthorized saves.

---

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (custom variables, modern grids/flexbox, keyframes), JavaScript (ES6+).
- **Icons**: [Ionicons](https://ionicons.com/).
- **Backend**: Node.js, Express (custom token authorization, JSON persistence, CORS middleware).

---

## How to Run Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Setup

1. Clone or copy this directory to your machine.
2. Install dependencies:
   ```bash
   npm install
   ```

### Starting the Server

Start the local Express server:
```bash
node server.js
```
The application will start running on **[http://localhost:3000](http://localhost:3000)**.

---

## Managing Your Portfolio

### 1. The Admin Dashboard
Go to **[http://localhost:3000/admin.html](http://localhost:3000/admin.html)** to edit the content.

### 2. Authentication Credentials
Login to the admin dashboard using the credentials defined in your local `.env` file:
- **Default Username**: `SRIGANESH`
- **Default Password**: `592005sri`

To change your credentials, open the `.env` file in the root of the project and modify the `ADMIN_USERNAME` and `ADMIN_PASSWORD` fields, then restart the server.

### 3. Updating the Resume
You can update your Resume URL (e.g., Google Drive link or local file path) directly in the **Hero Section** of the Admin dashboard.

### 4. Updating the Profile Photo
Place your image file in the project folder and type its filename (e.g., `20260328_152906.jpg`) in the **Profile Image URL / Path** field under the **About Section** of the Admin dashboard.
