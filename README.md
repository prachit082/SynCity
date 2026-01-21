# SynCity - Smart Energy Grid Management System

SynCity is a comprehensive **Smart City Energy Grid Management System** designed to monitor, analyze, and control urban energy consumption in real-time.

Built as a Research Project, it simulates an IoT-connected power grid where administrators and staff can visualize live sensor data, detect critical load anomalies, and intervene instantly to prevent system failures. It features role-based access control, predictive analytics for load forecasting, and a secure audit trail for forensic accountability.

## 📋 <a name="table">Table of Contents</a>

1. ⚙️ [Tech Stack](#tech-stack)
2. 🔋 [Features](#features)
3. 🤸 [Quick Start](#quick-start)

---

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Angular](https://angular.io/)** (v19) is a platform for building mobile and desktop web applications. It provides a robust framework for the frontend, utilizing components, services, and dependency injection to create a dynamic Single Page Application (SPA).

- **[Chart.js](https://www.chartjs.org/)** & **[ng2-charts](https://valor-software.com/ng2-charts/)** provide powerful, responsive data visualization. They are used to render the real-time line charts that display energy usage trends and predictive forecasts.

- **[Express.js](https://expressjs.com/)** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It powers the RESTful API backend.

- **[MongoDB](https://www.mongodb.com/)** is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, it stores all system data including user profiles, energy readings, alerts, and audit logs.

- **[Mongoose](https://mongoosejs.com/)** provides a straight-forward, schema-based solution to model the application data. It includes built-in type casting, validation, query building, and business logic hooks.

- **[Node.js](https://nodejs.org/)** is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, serving as the core of the backend server.

- **[Socket.io](https://socket.io/)** is a library that enables low-latency, bidirectional and event-based communication between a client and a server. It is the backbone of the real-time sensor updates, alerts, and chat features.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework packed with classes that can be composed to build any design, directly in the markup. It handles all styling, responsiveness, and dark mode theming.

## <a name="features">🔋 Features</a>

👉 **Real-Time Visualization**: Watch energy consumption data stream in live from simulated IoT sensors with dynamic, animated charts.

👉 **Predictive Analytics**: Integrated client-side linear regression algorithms forecast energy trends 20 seconds into the future to predict load spikes before they happen.

👉 **Role-Based Access Control (RBAC)**: Distinct dashboards and capabilities for **Admins** (control system, view logs) and **Staff** (monitor, resolve alerts).

👉 **Interactive System Control**: Admins can use the "Emergency Stop" master switch to remotely halt all sensor operations and simulation data.

👉 **Incident Management**: Automated alert generation when load thresholds are breached. Staff can acknowledge, investigate, and mark incidents as "Resolved" with resolution notes.

👉 **Secure Audit Trails**: A forensic "Activity Log" that immutably records every sensitive action (login, configuration change, system toggle) for security compliance.

👉 **Shift Handover Log**: A real-time, shared message board for staff to leave notes for the next shift, fostering collaboration.

👉 **Responsive Dark Mode**: A fully adaptive UI that switches seamlessly between Light and Dark themes based on user preference or system settings.

👉 **Data Export**: Generate and download CSV reports of historical sensor data for external analysis.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en) (v18 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [MongoDB Atlas](https://www.mongodb.com/atlas) Account (or local MongoDB installed)

**Cloning the Repository**

```bash
git clone https://github.com/prachit082/SynCity.git
cd SynCity
```

**1. Backend Setup:**

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Set Up Environment Variables:

->Create a new file named `.env` in the backend folder and add the following content:

```env
NODE_ENV='development'
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_jwt_key
```

Start the Backend Server:

```bash
npm run dev
```

The server will start on port 5000 and connect to your database.

**2. Frontend Setup:**

Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

Run the Frontend:

```bash
ng serve -o
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

Default Login Credentials:

- Admin Role: Username "admin"
- Staff Role: Username "john" , Pass "john20"
