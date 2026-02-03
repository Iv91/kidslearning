# KidsLearning – Django + React English Learning Platform (Multilingual UI)

KidsLearning is an interactive English learning platform for children, built with a **Django REST API backend** and a **React frontend**.

The platform includes a **multilingual user interface** (English / Serbian / German), while all quiz and lesson content remains in **English** to support language learning practice.

This project is ideal as a starter kit for building a full educational website with interactive quizzes, games, and progress tracking.

---

## 🚀 Features

✅ Django REST API backend  
✅ React quiz/game frontend  
✅ Multilingual UI (EN / SR / DE)  
✅ Admin panel to manage lessons + quizzes  
✅ Demo lesson + demo quizzes included  
✅ Ready-to-extend clean project structure  

---

## 🎮 Quiz Types Included

- **Visual Quiz** (choose the correct image)
- **Audio Quiz** (listen and answer)
- **Spelling Quiz** (missing letter game)
- **Multiple Choice Quiz**

---

## 📂 Project Structure

kidslearning/
│
├── lessons/ # Lesson app (videos + explanations)
├── quizzes/ # Quiz logic + REST API
├── resources/ # Downloadable worksheets module (extendable)
├── blog/ # Blog module (optional)
│
├── quiz-frontend/ # React frontend for quizzes and games
│
├── media/ # Uploaded media (images/audio/video)
├── media_demo/ # Demo media assets for buyers
│
├── templates/ # Django templates (homepage, base UI)
├── static/ # Static files (CSS, icons)
│
├── manage.py
├── requirements.txt
└── README.md


---

## ✅ Requirements

### Backend
- Python **3.10+**
- pip + venv
- SQLite (default) or PostgreSQL (optional)

### Frontend
- Node.js **18+**
- npm

---

## ⚙️ Installation Guide

---

# 1️⃣ Backend Setup (Django)

Open a terminal inside the project root folder.

### Create virtual environment

```bash
python -m venv venv
Activate virtual environment
Windows (PowerShell):

venv\Scripts\activate
Mac/Linux:

source venv/bin/activate


Install backend dependencies
pip install -r requirements.txt
Run migrations
python manage.py migrate
Create admin superuser
python manage.py createsuperuser
Start the Django backend server
python manage.py runserver
Backend will run at:

http://127.0.0.1:8000/
Admin panel:

http://127.0.0.1:8000/admin/


2️⃣ Frontend Setup (React)
Open a second terminal window:

cd quiz-frontend
npm install
npm start
React frontend will run at:

http://localhost:3000/
✅ Demo Content Setup (Recommended)
This project includes demo quizzes + demo lesson so buyers can preview everything instantly.

1) Copy Demo Media Files
Demo images/audio are stored in:

media_demo/
Copy them into your active media/ folder:

Windows (PowerShell)
Copy-Item -Path .\media_demo\* -Destination .\media\ -Recurse -Force
Mac/Linux
cp -r ./media_demo/* ./media/


2) Load Demo Fixtures
Run:

python manage.py loaddata lessons/fixtures/demo_lessons.json
python manage.py loaddata quizzes/fixtures/demo_quizzes.json
3) Run the Full Platform
Backend:

python manage.py runserver
Frontend:

cd quiz-frontend
npm start
Now open:

✅ Main Django site:

http://127.0.0.1:8000/
✅ React quiz frontend:

http://localhost:3000/
🌍 Multilingual Support
KidsLearning includes multilingual interface support:

English (default)

Serbian

German

All quizzes remain in English to help children practice the language.