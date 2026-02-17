# Task Manager - Technical Test

As requested for this technical test, I created a task manager within a one-week timeframe with the following features:

## Project Structure
```
Task-Manager-Web-Application/
├── backend/
│   ├── main.py              # FastAPI + database logic
│   ├── app.db               # SQLite database (auto-generated)
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── css/
│   │   ├── reset.css        # Browser styles reset
│   │   └── style.css        # All app styles
│   ├── javascript/
│   │   ├── api.js           # HTTP calls to backend
│   │   ├── app.js           # Main logic + task management
│   │   ├── config.js        # Configurations (initial balance, costs)
│   │   ├── headerModal.js   # Wallet and Audit Log modals
│   │   ├── taskArray.js     # Task array management + search
│   │   └── utils.js         # Utility functions (dates, modals, etc)
│   ├── html/
│   │   └── index.html       # Single page app
│   └── resources/           # Icons and images
├── docker-compose.yml       # Container orchestration
├── .gitignore
└── README.md
```

## Features

### Core Requirements
- **Task CRUD**: create, edit (by clicking the card), delete and change task status
- **Wallet System**: credit system with automatic transactions
  - Create task: -1 credit
  - Complete task (DONE): +2 credits
  - Delete incomplete task: +1 credit (refund)
- **Audit Log**: tracks all important actions with timestamps (clickable from the audit log button in the header)
- **Wallet Transactions**: tracks all transactions (clickable from the balance button in the header)

### Extra Features
- **Search & Filters**: full-text search bar on title, description, priority, status, timestamp
- **Automatic Sorting**: tasks sorted by status → priority → creation date
- **Persistence**: SQLite database, data survives restart
- **Docker**: setup with a single command
- **UI/UX**: clean interface with animations, modal for editing, validations

## Technologies Used

**Backend:**
- Python 
- FastAPI
- SQLite
- uvicorn 

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript
- No frameworks

**DevOps:**
- Docker + Docker Compose
- Nginx (serving frontend)

## System Requirements

- Linux or WSL
- Docker
- Docker Compose

## Installation and Setup

### With Docker (recommended)
```bash
# 1. Clone the repository
git clone git@github.com:MegumiSharp/Task-Manager-Web-Application.git
cd Task-Manager-Web-Application

# 2. Start with Docker
docker-compose up --build

# 3. Open browser
# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
```

## How to Use

1. **Create a task**: click "Add New Task", fill in title (required) and description, choose priority and status
2. **Edit a task**: click on a card to open the edit modal
3. **Complete a task**: click the checkmark ✓ on the card
4. **Delete a task**: click the red X
5. **View wallet**: click the credits button at the top (shows transaction history)
6. **View audit log**: click "Audit Log" to see all recorded actions
7. **Search tasks**: use the search bar (minimum 2 characters)

## Configuration

You can modify the initial balance and costs in `frontend/javascript/config.js`:
```javascript
export const STARTER_BALANCE = 100;  // Initial balance
export const TRANSACTION_AMOUNT = {
    CREDIT: 2,    // Credits for completing task
    DEBIT: 1,     // Cost to create task
    REFUND: 1     // Refund for deleting incomplete task
};
```

**Reset everything (including database):**
```bash
docker-compose down -v
docker-compose up --build
```

## Development Notes

I used vanilla JavaScript to avoid framework complexity and to focus on better understanding JavaScript fundamentals. I also used Figma for creating UI mockups, which helped me with CSS styling.

This project was exactly what I needed - having a time limit pushed me to give my best. Even under time pressure, I took the time to understand concepts and study properly when adding features. I essentially had to re-learn JavaScript from scratch, which is noticeable in the initial code. Driven by urgency and the need to learn, I focused on implementing features and making sure they worked, planning to improve them later - but that "later" accumulated at the end. CSS suffered from this too, but I had to leave it as is due to time constraints. I'll improve it in the future.

After the deadline, regardless of the outcome, I'll continue working on this project because it taught me a lot in a short time..

### What I Would Have Liked to Add
- More test cases
- Better external documentation
- Improved and less rushed naming conventions
- More standard-compliant commit schema
- Better upfront planning instead of figuring things out as I went

---

**Developed for:** G-nous srl - Technical Test for Internship  
**Author:** Gaetano Simone Enselmi  
**Date:** 11/02/2025 → 17/02/2025