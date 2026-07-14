# Software Engineering Fundamentals Assignment

This repository contains the web application developed for the Software Engineering Fundamentals university assignment. It features a complete role-based workflow for petrol ordering, inventory stock management, and delivery logistics tracking.

## Features

- **Customer Dashboard**: Place orders for petrol (Ron 95, Ron 97, Diesel), check estimated delivery times, view status updates, and submit support feedback.
- **Driver Dashboard**: Accept pending orders, update delivery statuses (Assigned -> On the Way -> Delivered), and review past orders.
- **Resource Manager Dashboard**: Monitor current petrol stock levels and toggle petrol availability.
- **Admin Dashboard**: Comprehensive user management (create, edit, delete users), view all orders, and read customer feedbacks.

---

## Getting Started

Follow these steps to run the application locally on your computer:

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Start the Server
Run the start script to initialize the SQLite database and launch the Express backend:
```bash
npm start
```

The database file `database.db` will be auto-created and populated with default mock data if it does not already exist.

### 3. Open the Application
Navigate to the following address in your browser:
* **http://localhost:3000**

---

## Default Login Credentials

You can log in as any of the default pre-seeded roles below:

| Username | Password | Role / Role Type |
|---|---|---|
| `admin` | `admin123` | **Admin** (Administrator Control Panel) |
| `john_doe` | `johnjohn123` | **Customer** (Order petrol, check delivery) |
| `jane_smith` | `janejane123` | **Customer** (Order petrol, check delivery) |
| `driver_1` | `driverpass` | **Driver** (Claim orders, update status) |
| `manager_1` | `managerpass` | **ResourceManager** (Update stock levels) |

---

## Solutions for Running Without a Custom Domain

If you want to demo or share this project without purchasing a custom domain, you can use these free alternatives:

### 1. Temporary Public Link (Localtunnel) - *Highly Recommended*
To share your locally running application with peers or grading instructors without deploying it to the cloud:
1. Run your server locally: `npm start`.
2. Open another terminal tab/window and run:
   ```bash
   npx localtunnel --port 3000
   ```
3. It will generate a temporary public URL (e.g., `https://funny-deer-run.loca.lt`) that redirects visitors directly to your local computer.

### 2. Free Web Hosting (Glitch.com)
For a permanent, free public URL (e.g., `https://your-project.glitch.me`):
1. Import this repository into [Glitch.com](https://glitch.com).
2. Glitch supports Node.js and persistent SQLite directories, meaning your orders and user accounts will stay saved even when the server goes idle.

### 3. Free Web Services (Render.com)
You can link your GitHub repository to a free Web Service on [Render](https://render.com).
* *Note:* SQLite database files (`database.db`) are ephemeral on Render's free tier, meaning database records will reset to the default pre-seeded state whenever the server container restarts (due to inactivity or redeployments).

---

## GitHub Upload Instructions

To upload this workspace into your own GitHub repository:

1. Create a new repository on your [GitHub](https://github.com/) account (leave "Initialize with README", "Add .gitignore", and "Choose a license" unchecked).
2. Open a terminal in this project folder and run the following commands:
   ```bash
   # Initialize local git repository
   git init

   # Add all files to staging
   git add .

   # Commit changes
   git commit -m "Initial commit: prepared codebase for GitHub and fixed SQLite initialization"

   # Link local git repository to GitHub
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

   # Rename branch to main
   git branch -M main

   # Push to GitHub
   git push -u origin main
   ```
