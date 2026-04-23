import mysql.connector
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="", 
        database="hostelflow",
        port=3307 
    )

# --- 1. AUTHENTICATION ---
@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT user_id, username, role FROM Users WHERE email = %s AND password_hash = %s", (email, password))
        user = cursor.fetchone()
        if user:
            return {"status": "success", "role": user['role'], "user_id": user['user_id'], "username": user['username']}
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    finally:
        db.close()

# --- 2. ADMIN SECTION ---
@app.get("/admin/stats")
async def get_admin_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM Hostel_Rooms")
        total_rooms = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Complaints")
        total_complaints = cursor.fetchone()[0]
        cursor.execute("SELECT SUM(amount) FROM Fees WHERE status = 'Paid'")
        total_revenue = cursor.fetchone()[0] or 0
        return {"total_rooms": total_rooms, "pending_complaints": total_complaints, "total_revenue": float(total_revenue)}
    finally:
        db.close()

@app.get("/admin/rooms")
async def get_all_rooms():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Hostel_Rooms ORDER BY room_no ASC")
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/admin/add-room")
async def add_room(room_no: str = Form(...), capacity: int = Form(...), block: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO Hostel_Rooms (room_no, capacity, block, status) VALUES (%s, %s, %s, 'Available')", (room_no, capacity, block))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# --- ADMIN FEE LOGIC ---
@app.post("/admin/generate-fees")
async def generate_fees(amount: int = Form(...), month: str = Form(...), fee_type: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT student_id FROM Students")
        students = cursor.fetchall()
        for (s_id,) in students:
            cursor.execute("""
                INSERT INTO Fees (student_id, amount, fee_type, billing_month, status) 
                VALUES (%s, %s, %s, %s, 'Unpaid')
            """, (s_id, amount, fee_type, month))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

@app.get("/admin/fees-summary")
async def get_fees_summary():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT f.*, u.username FROM Fees f JOIN Students s ON f.student_id = s.student_id JOIN Users u ON s.user_id = u.user_id ORDER BY f.fee_id DESC"
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/admin/approve-fee")
async def approve_fee(fee_id: int = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("UPDATE Fees SET status = 'Paid', payment_date = %s WHERE fee_id = %s", (today, fee_id))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# --- ADMIN COMPLAINTS ---
@app.get("/admin/complaints")
async def get_admin_complaints():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT c.*, u.username as student_name FROM Complaints c LEFT JOIN Students s ON c.student_id = s.student_id LEFT JOIN Users u ON s.user_id = u.user_id ORDER BY created_at DESC"
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        db.close()

@app.delete("/admin/resolve-complaint/{complaint_id}")
async def resolve_complaint(complaint_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM Complaints WHERE complaint_id = %s", (complaint_id,))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# --- 3. WARDEN SECTION ---
@app.get("/warden/attendance")
async def get_warden_attendance():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT a.*, u.username FROM Attendance a JOIN Students s ON a.student_id = s.student_id JOIN Users u ON s.user_id = u.user_id ORDER BY marked_date DESC")
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/warden/update-mess")
async def update_mess(day: str = Form(...), type: str = Form(...), dish: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO Mess_Menu (day_of_week, meal_type, dish_name) VALUES (%s, %s, %s)", (day, type, dish))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

@app.post("/warden/send-notification")
async def send_notif(sender_id: int = Form(...), title: str = Form(...), message: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO Notifications (sender_id, title, message) VALUES (%s, %s, %s)", (sender_id, title, message))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# MISSING WARDEN STATS ENDPOINT
@app.get("/warden/stats")
async def get_warden_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("SELECT COUNT(*) FROM Attendance WHERE marked_date = %s AND status = 'Present'", (today,))
        present_count = cursor.fetchone()[0]
        return {"present_today": present_count}
    finally:
        db.close()

# --- 4. STUDENT SECTION ---
@app.get("/student/fees/{student_id}")
async def get_student_fees(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Fees WHERE student_id = %s ORDER BY fee_id DESC", (student_id,))
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/student/submit-payment")
async def submit_payment(fee_id: int = Form(...), trans_id: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("UPDATE Fees SET stripe_payment_id = %s, status = 'Pending' WHERE fee_id = %s", (trans_id, fee_id))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# MISSING ATTENDANCE MARKING ENDPOINT
@app.post("/student/mark-attendance")
async def mark_attendance(student_id: int = Form(...), status: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("SELECT * FROM Attendance WHERE student_id = %s AND marked_date = %s", (student_id, today))
        if cursor.fetchone():
            return {"status": "error", "message": "Attendance already marked!"}
        cursor.execute("INSERT INTO Attendance (student_id, marked_date, status) VALUES (%s, %s, %s)", (student_id, today, status))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

@app.get("/student/notifications")
async def get_notifs():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Notifications ORDER BY created_at DESC LIMIT 10")
        return cursor.fetchall()
    finally:
        db.close()

@app.get("/warden/menu")
async def get_menu():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Mess_Menu")
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/student/add-complaint")
async def student_comp(student_id: int = Form(...), type: str = Form(...), desc: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO Complaints (student_id, complaint_type, description, priority, status) VALUES (%s, %s, %s, 'Medium', 'Unresolved')", (student_id, type, desc))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()