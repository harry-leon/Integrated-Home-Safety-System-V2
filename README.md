# 🛡️ Integrated Home Safety System V2 (Smart Lock System)

Welcome to the **Integrated Home Safety System V2** repository! This project is a modern, full-stack Monorepo designed to build a secure, responsive, and robust smart lock and home safety monitoring platform.

---

## 🏗️ Architecture & Tech Stack

This project adopts a **Monorepo** structure, housing both the API backend and the user interface application, orchestrated seamlessly via Docker and GitHub Actions.

### Backend (`/backend`)
- **Framework:** Spring Boot 3 (Java 17)
- **Security:** Spring Security + JWT Authentication
- **Database:** H2 In-Memory Database (Configured for quick local development)
- **Migrations:** Flyway (Automatically handles schema creation and data seeding)
- **Build Tool:** Maven

### Frontend (`/frontend`)
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS V4
- **Package Manager:** npm

### DevOps / CI
- **CI/CD:** GitHub Actions (Automated Linting, Testing, and Building)
- **Containerization:** Docker Compose
- **Version Control Rules:** Strict Branch Protection, Fail-fast CI enforcement, Required Code Reviews.

---

## ✨ Features

- **Robust Authentication:** JWT-based secure login, registration, and RBAC (Role-Based Access Control).
- **Device Management:** Register, monitor, and configure smart locks and home sensors.
- **Access Logs & Analytics:** Realtime monitoring and logging of lock/unlock events and unauthorized intrusion attempts.
- **Automated Database Seeding:** Flyway automatically populates the database with mocked sensors, devices, and user data on first launch.
- **Continuous Integration Pipeline:** Any code pushed must pass automated linters and Maven builds.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/harry-leon/Integrated-Home-Safety-System-V2.git
cd Integrated-Home-Safety-System-V2
```

### 2. Run the Backend (Spring Boot)
Ensure you have **Java 17** installed.
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*Note: The application will start on `http://localhost:8080`. Flyway will automatically run `V1__init_schema.sql` and `V2__seed_data.sql` to initialize your local database.*

### 3. Run the Frontend (Next.js)
Ensure you have **Node.js 20+** installed.
```bash
cd frontend
npm install
npm run dev
```
*Note: The Next.js frontend will be accessible at `http://localhost:3000`.*

---

## 🔑 Test Credentials 

Upon starting the backend, Flyway automatically seeds the H2 database with the following test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smartlock.com` | `password` |
| **Standard User** | `user@smartlock.com` | `password` |

You can also access the **H2 Web Console** directly via your browser:
- **URL:** `http://localhost:8080/h2-console`
- **JDBC URL:** `jdbc:h2:mem:smartlockdb`
- **Username:** `sa`
- **Password:** *(leave blank)*

---

## 🤝 Contribution Guidelines

This repository enforces a strict **Fail-Fast** CI workflow on the `dev` and `main` branches.
1. Create a descriptive feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat: your description"`
3. Push to your branch: `git push -u origin feature/your-feature-name`
4. **Create a Pull Request.** Your code will be automatically checked by GitHub Actions.
5. If the CI build fails, the Merge button is blocked. You must fix your code before requesting a review.
6. A peer code review (Approve) is required before merging.
