# 🚀 Full-Stack Web App (Golang + Next.js SSR)

This is a **full-stack application** featuring:

- ✅ Backend: [Golang](https://golang.org/)
- ✅ Frontend: [Next.js](https://nextjs.org/) with **Server-Side Rendering (SSR)**
- ✅ Dockerized infrastructure with **Nginx reverse proxy**
- ✅ Automatic deployment using **GitHub Actions CI/CD**

---

## 🧱 Project Architecture

project-root/
├── backend/ # Golang API service
├── frontend/ # Next.js SSR frontend
├── nginx/ # Nginx reverse proxy config
├── docker-compose.yml
└── .github/workflows/deploy.yml


---

## ⚙️ Technologies Used

| Layer           | Stack                        |
|-----------------|------------------------------|
| Backend         | Golang                       |
| Frontend (SSR)  | Next.js (React)              |
| Reverse Proxy   | Nginx                        |
| Containers      | Docker & Docker Compose      |
| CI/CD Pipeline  | GitHub Actions               |

---

## 🚀 Deployment Flow

1. Push to the `main` branch triggers a GitHub Actions workflow
2. The entire project is securely copied to the server over SSH
3. On the server, `docker compose up --build -d` is executed
4. Nginx handles:
   - Routing between frontend and backend
   - Static asset caching
   - HTTPS (if configured with Certbot)

---

## 🌐 Routing

- `/` → Forwarded to the **Next.js SSR frontend**
- `/api/...` → Forwarded to the **Golang backend**

---

## 🔐 Server Requirements

- Linux server with SSH access
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- SSH private key (stored in GitHub Secrets)
- *(Optional)* Certbot + Nginx for HTTPS

---

## ✅ Benefits

- Fully containerized (no need to install Go or Node.js on the server)
- Fast, secure, and SEO-friendly frontend
- Clean CI/CD pipeline via GitHub Actions
- Easy to manage, extend, and deploy

---

> Built with ❤️ using Go, Next.js, Docker, and a love for clean architecture.
