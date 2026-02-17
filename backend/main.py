from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import sqlite3
import os

DATABASE_NAME = "app.db"

# In Docker, requests come from nginx (same origin via proxy), so CORS isn't needed.
ALLOWED_ORIGINS = [
    "http://localhost:5500",    # Local dev (Live Server)
    "http://127.0.0.1:5500",    # Local dev (Live Server alt)
    "http://localhost",         # Docker
    "http://localhost:8080",      # Docker explicit port
]

@asynccontextmanager
async def server_lifespan(app: FastAPI):
        print("Server FastAPI in avvio...")
        create_db()
        print("✅ Server Pronto")
        yield
        print("Server in chiusura")

app = FastAPI(lifespan=server_lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ═══════════════════════════════════════════════════════════
# Data Model
# ═══════════════════════════════════════════════════════════

class Task(BaseModel):
        uid: Optional[str] = None
        title: str
        description: str
        urgency: str
        state: str
        datetime: str

class Transaction(BaseModel):
        uid: Optional[str] = None
        title: str
        type: str
        amount: int
        balance: int
        timestamp: str

class Event(BaseModel):
        taskId: Optional[str] = None
        title: str
        type: str
        priority: str
        state: str
        timestamp: str

# ═══════════════════════════════════════════════════════════
# Database Functions
# ═══════════════════════════════════════════════════════════

def get_db_connection():
        connection = sqlite3.connect(DATABASE_NAME)
        connection.row_factory = sqlite3.Row
        return connection
        
def create_db():
        connection = sqlite3.connect(DATABASE_NAME)
        connection.execute('''
        CREATE TABLE IF NOT EXISTS tasks(
                task_id TEXT PRIMARY KEY, 
                title TEXT NOT NULL,
                description TEXT,
                urgency TEXT NOT NULL,
                state TEXT NOT NULL,
                datetime TEXT NOT NULL)
        ''')

        connection.execute('''
        CREATE TABLE IF NOT EXISTS wallet_transactions(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL, 
                title TEXT NOT NULL,
                task_uid TEXT NOT NULL,
                balance TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                amount TEXT NOT NULL)
        ''')

        connection.execute('''
        CREATE TABLE IF NOT EXISTS events(
                id_event INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL, 
                timestamp TEXT NOT NULL,
                title TEXT NOT NULL,
                taskId TEXT NOT NULL,
                priority TEXT NOT NULL,
                state TEXT NOT NULL)
        ''')

        connection.commit()
        connection.close()
        print("✅ Database inizializzato!")
        

@app.get("/")
def root():
        return{
            "message": "Task Manager API",
            "status": "running",
            "endpoints": {
                "GET /tasks": "Get All tasks",
                "POST /tasks": "Create Task in Database",
                "PUT /tasks/{uid}": "Update task in Database",
                "DELETE /tasks/{uid}": "Delete task in Database",    
                "POST /wallet" : "Create Wallet Transaction in Database",
                "GET /wallet" : "Get All transactions",
                "POST /audit" : "Create audit log in Database",
                "GET /audit" : "Get All audit logs"
        }}


@app.post("/tasks")
def create_task(task: Task):
    print(f"✅ Richiesta POST /tasks ricevuta: {task.title}")
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO tasks (task_id, title, description, urgency, state, datetime) VALUES (?,?,?,?,?,?)",
        (task.uid, task.title, task.description, task.urgency, task.state, task.datetime)
    )
    conn.commit()
    conn.close()
    print(f"✅ Task creato con ID: {task.uid}")
    return {"message": "Task creato con successo"}


@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    print(f"✅ Richiesta DELETE /tasks ricevuta: {task_id}")
    conn = get_db_connection()
    cursor = conn.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
    conn.commit()
    if cursor.rowcount == 0:
           conn.close()
           raise HTTPException(status_code=404, detail="Task non trovato")
    conn.close()
    print(f"✅ Task {task_id} eliminato")
    return {"message": "Task eliminato con successo"}


@app.get("/tasks")
def get_tasks():
        conn = get_db_connection()
        cursor = conn.execute("SELECT * FROM tasks ORDER BY datetime DESC")
        tasks = []
        for record in cursor.fetchall():
            tasks.append({
                "title": record["title"],
                "description": record["description"],
                "urgency": record["urgency"],
                "uid": record["task_id"],
                "state": record["state"],
                "datetime": record["datetime"]
            })
        conn.close()
        return tasks


@app.put("/tasks/{task_id}")
def edit_task(task_id: str, task: Task):
    print(f"✅ Richiesta EDIT /tasks ricevuta: {task.title}")
    conn = get_db_connection()
    cursor = conn.execute(
        "UPDATE tasks SET title = ?, description = ?, urgency = ?, state = ? WHERE task_id = ?", 
        (task.title, task.description, task.urgency, task.state, task_id))
    conn.commit()
    if cursor.rowcount == 0:
          conn.close()
          raise HTTPException(status_code=404, detail="Task non trovato")
    conn.close()
    print(f"✅ Task {task_id} modificato")
    return {"message": "Task modificato con successo"}


# ═══════════════════════════════════════════════════════════
# WALLET TRANSACTIONS
# ═══════════════════════════════════════════════════════════

@app.post("/wallet")
def create_transaction(transaction: Transaction):
    print(f"✅ Richiesta POST /wallet ricevuta: {transaction.title}")
    conn = get_db_connection()
    conn.execute(
            "INSERT INTO wallet_transactions (type, title, task_uid, balance, timestamp, amount) VALUES (?,?,?,?,?,?)",
            (transaction.type, transaction.title, transaction.uid, transaction.balance, transaction.timestamp, transaction.amount)
        )
    conn.commit()
    conn.close()
    print(f"✅ Transaction added to db")
    return {"message": "Transactions added success"}


@app.get("/wallet")
def get_transactions():
        conn = get_db_connection()
        cursor = conn.execute("SELECT * FROM wallet_transactions ORDER BY id ASC")
        transaction = []
        for record in cursor.fetchall():
            transaction.append({
                "type": record["type"],
                "timestamp": record["timestamp"],
                "title": record["title"],
                "uid": record["task_uid"],
                "balance": int(record["balance"]),
                "amount": int(record["amount"])
            })
        conn.close()
        return transaction


# ═══════════════════════════════════════════════════════════
# AUDIT LOG
# ═══════════════════════════════════════════════════════════

@app.post("/audit")
def create_event(event: Event):
    print(f"✅ Richiesta POST /audit ricevuta: {event.title}")
    conn = get_db_connection()
    conn.execute(
            "INSERT INTO events (type, title, taskId, priority, timestamp, state) VALUES (?,?,?,?,?,?)",
            (event.type, event.title, event.taskId, event.priority, event.timestamp, event.state)
        )
    conn.commit()
    conn.close()
    print(f"✅ Event added to db")
    return {"message": "Event added success"}


@app.get("/audit")
def get_audit_log():
        conn = get_db_connection()
        cursor = conn.execute("SELECT * FROM events ORDER BY taskId ASC")
        events = []
        for record in cursor.fetchall():
            events.append({
                "type": record["type"],
                "timestamp": record["timestamp"],
                "taskId": record["taskId"],
                "title": record["title"],
                "priority": record["priority"],
                "state": record["state"]
            })
        conn.close()
        return events