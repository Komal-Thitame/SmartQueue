# 🏥 SmartQueue - Hospital Queue & Appointment Management System

![Java](https://img.shields.io/badge/Java-21-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![JWT](https://img.shields.io/badge/JWT-HS256-black?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-green)

**SmartQueue** is a full-stack Hospital Queue and Appointment Management System engineered to eliminate physical waiting lines in hospital OPDs, reduce patient waiting times, and optimize clinical workflows through real-time queue tracking and token synchronization.

---

## 📌 Key Highlights

- **Role-Based Portals:** Dedicated interactive dashboards for **Admin**, **Doctor**, **Receptionist**, and **Patient**.
- **Real-Time Token Engine:** Generates doctor-wise sequential tokens, tracks live status (`WAITING` ➔ `IN-PROGRESS` ➔ `COMPLETED` / `SKIPPED`), and calculates estimated wait times dynamically.
- **Walk-in & Online Sync:** Seamlessly integrates offline walk-in OPD appointments with online patient bookings into a single, unified queue.
- **Enterprise Security:** Secured with **JWT (JSON Web Tokens)**, custom `OncePerRequestFilter`, **BCrypt** password hashing, and **Role-Based Access Control (RBAC)**.

---

## 👥 User Roles & Features

### 👨‍💼 Super Admin Dashboard
- Hospital-wide live queue control center and OPD status matrix.
- Doctor management (add, edit, toggle availability, delete).
- Receptionist staff management (counter allocation, shifts, account toggle).
- Registered patient monitoring and detailed visit history overview.
- Hospital OPD configuration and settings management.

### 👨‍⚕️ Doctor Console
- Live today's patient queue sorted sequentially by token number.
- Patient consultation controls: **Start Checkup (`IN-PROGRESS`)**, **Complete (`COMPLETED`)**, **Skip**, and **Recall**.
- Automated consultation timer tracking actual minutes spent per patient.
- Patient medical visit and consultation history.

### 👩‍💼 Receptionist Portal
- Walk-in OPD patient counter registration and instant token generation.
- Today's appointment verification and patient check-in management.
- Live doctor availability and waiting queue monitoring.
- Patient lookup by name, phone, or appointment ID.

### 👤 Patient Portal
- User self-registration and secure login.
- Online appointment booking with department and doctor selection.
- **My Tokens**: Real-time token tracking, live status (`WAITING`, `IN-PROGRESS`), and estimated wait times.
- Appointment cancellation and personal consultation history.
- Profile management with dynamic personal information updates.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (v19), Vite, Bootstrap 5, React Router Dom, Axios, React Icons, Recharts |
| **Backend** | Java 21, Spring Boot 3, Spring Data JPA, Spring Security, JWT (JJWT 0.11.5) |
| **Database** | MySQL 8.0 / MariaDB |
| **Build Tools** | Maven, npm |
| **Version Control** | Git, GitHub |

---

## 🔐 Security Architecture

- **Token-Based Authentication:** Stateless JWT issuance with 24-hour expiration and custom payload claims (`email`, `role`).
- **Authorization Filter:** Custom `JwtAuthenticationFilter` intercepts requests to validate `Authorization: Bearer <token>` and injects authentication into Spring's `SecurityContextHolder`.
- **Password Security:** Multi-round `BCryptPasswordEncoder` ensures zero plaintext credential storage.
- **CORS Protection:** Configured `CorsConfigurationSource` allowing verified frontend origins with full credential support.

---

## 📂 Project Structure

```text
SmartQueue
│
├── smartqueue-frontend/          # React.js SPA (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, DoctorCards, Analytics)
│   │   ├── pages/                # Role dashboards (Admin, Doctor, Receptionist, Patient)
│   │   │   ├── doctor/           # DoctorQueue, DoctorDashboard, DoctorPatients
│   │   │   ├── receptionist/     # ReceptionistAppointments, ReceptionistQueue
│   │   │   └── patient/          # PatientDashboard, BookAppointment, MyTokens
│   │   ├── styles/               # CSS modules & styling
│   │   ├── config.js             # API base URL configuration
│   │   └── App.jsx               # Route definitions
│   └── package.json
│
├── smartqueue-backend (1)/
│   └── smartqueue-backend/       # Spring Boot Application
│       ├── src/main/java/com/smartqueue/smartqueue_backend/
│       │   ├── config/           # Database seed data & bean configurations
│       │   ├── controller/       # REST API Controllers (Admin, Auth, Doctor, Queue, etc.)
│       │   ├── dto/              # Data Transfer Objects (Login, Register, AppointmentDTO)
│       │   ├── entity/           # JPA Entities (User, Doctor, Appointment, QueueToken)
│       │   ├── repository/       # Spring Data JPA Repositories
│       │   ├── security/         # SecurityConfig, JwtService, JwtAuthenticationFilter
│       │   └── service/          # Business Logic Services
│       ├── src/main/resources/
│       │   └── application.properties # Server port & MySQL configuration
│       └── pom.xml
│
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- **Java Development Kit (JDK 21)**
- **Node.js (v18+) & npm**
- **MySQL Server (v8.0+)**

### 2. Database Setup
Create a MySQL database named `smartqueue_db`:
```sql
CREATE DATABASE smartqueue_db;
```
Configure your database credentials in `smartqueue-backend/.../src/main/resources/application.properties`:
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/smartqueue_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 3. Backend Setup
Navigate to the backend directory and run:
```bash
cd "smartqueue-backend (1)/smartqueue-backend"
mvn clean compile
mvn spring-boot:run
```
Backend will start on: **`http://localhost:8081`**

### 4. Frontend Setup
In a new terminal, navigate to the frontend directory:
```bash
cd smartqueue-frontend
npm install
npm run dev
```
Frontend will be accessible at: **`http://localhost:5173`**

---

## 🔑 Default Test Credentials

For quick evaluation and testing, you can use the following pre-configured accounts:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gmail.com` | `admin123` | `/admin/dashboard` |
| **Doctor** | `drsneha@gmail.com` | `snehapassword123` | `/doctor/dashboard` |
| **Receptionist** | `pooja.reception@gmail.com` | `poojapassword123` | `/receptionist/dashboard` |
| **Patient** | `testuser999@gmail.com` | `newpassword123` | `/patient/dashboard` |

---

## 👩‍💻 Developed By

**Komal Thitame**  
- MCA Student | Java Full Stack Developer  
- **GitHub:** [github.com/Komal-Thitame](https://github.com/Komal-Thitame)  
- **LinkedIn:** [linkedin.com/in/komal-thitame-404548385](https://www.linkedin.com/in/komal-thitame-404548385)  

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
