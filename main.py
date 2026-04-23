import mysql.connector
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import datetime
import stripe

app = FastAPI()

# Stripe Test Secret Key
stripe.api_key = "sk_test_51TPR0GFgrlc0O7eol2GxoePltTUm9R0poHRw9K6aw4l8hJ79zMYbRuie0KkqCBDRTp0MAnjIGhFSc7m8n0LSH6se00333pA586"

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

## --- 2. STRIPE PAYMENT FLOW ---
@app.post("/student/create-checkout-session")
async def create_checkout_session(fee_id: int = Form(...), amount: float = Form(...)):
    try:
        stripe_amount = int(amount * 100) 
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'pkr',
                    'product_data': {'name': f'Hostel Fee Payment ID: {fee_id}'},
                    'unit_amount': stripe_amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            # Success URL - Yahan backend ka rasta hi rahega
            success_url=f"http://127.0.0.1:8000/payment-success?fee_id={fee_id}",
            # Cancel URL - Yahan /test/ shamil kar diya hai
            cancel_url="http://127.0.0.1:5500/test/student/student_fees.html",
        )
        return {"url": session.url}
    except Exception as e:
        print(f"Stripe Error: {e}")
        return {"error": str(e)}

@app.get("/payment-success")
async def payment_success(fee_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        # Database update logic
        cursor.execute("UPDATE Fees SET status = 'Paid', payment_date = %s WHERE fee_id = %s", (today, fee_id))
        db.commit()
        
        # FIXED REDIRECT: Yahan '/test/' lagana zaroori tha taake folder match kare
        return RedirectResponse(url="http://127.0.0.1:5500/test/student/student_fees.html?payment=success")
    
    except Exception as e:
        print(f"Database Update Error: {e}")
        return {"error": "Database update failed but payment was successful."}
    finally:
        db.close()

# Is block ko apne main.py ke Admin Section se replace kar den
from fastapi import Form
import datetime

# ==========================================
# --- 3. ADMIN SECTION (FINAL UPDATED) ---
# ==========================================

@app.get("/admin/stats")
async def get_admin_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM Hostel_Rooms"); total_rooms = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Complaints"); total_complaints = cursor.fetchone()[0]
        cursor.execute("SELECT SUM(amount) FROM Fees WHERE status = 'Paid'"); total_revenue = cursor.fetchone()[0] or 0
        return {
            "total_rooms": total_rooms, 
            "pending_complaints": total_complaints, 
            "total_revenue": float(total_revenue)
        }
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

@app.get("/admin/complaints")
async def get_admin_complaints():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT c.*, u.username as student_name 
            FROM Complaints c 
            LEFT JOIN Users u ON c.student_id = u.user_id 
            ORDER BY c.created_at DESC
        """
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
        return {"status": "success", "message": "Complaint resolved successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@app.post("/admin/generate-fees")
async def generate_fees(amount: float = Form(...), month: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # Step 1: Hum specifically 'student_id' uthayenge (1 aur 2)
        cursor.execute("SELECT student_id, full_name FROM students")
        student_records = cursor.fetchall()
        
        if not student_records:
            return {"status": "error", "message": "Failure: No student records found in the system."}

        count = 0
        for record in student_records:
            s_id = record['student_id'] # Ab ye 1 aur 2 uthayega
            
            # Step 2: Fees table mein check karein ke is student_id ki entry hai ya nahi
            cursor.execute("SELECT * FROM Fees WHERE student_id = %s AND billing_month = %s", (s_id, month))
            
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO Fees (student_id, billing_month, amount, status) VALUES (%s, %s, %s, 'Unpaid')",
                    (s_id, month, amount)
                )
                count += 1
        
        db.commit()
        return {"status": "success", "message": f"Professional Alert: Fees generated for {count} student(s) successfully."}

    except Exception as e:
        return {"status": "error", "message": f"Database Conflict: {str(e)}"}
    finally:
        db.close()

@app.get("/admin/fees-summary")
async def get_fees_summary():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # Step 3: Join bhi student_id par hi hona chahiye
        query = """
            SELECT f.fee_id, f.billing_month as month, f.amount, f.status, f.payment_date, s.full_name as username 
            FROM Fees f 
            INNER JOIN students s ON f.student_id = s.student_id 
            ORDER BY f.fee_id DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/admin/approve-fee/{fee_id}")
async def approve_fee(fee_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today().strftime('%Y-%m-%d')
        cursor.execute("""
            UPDATE Fees 
            SET status = 'Paid', payment_date = %s 
            WHERE fee_id = %s
        """, (today, fee_id))
        db.commit()
        return {"status": "success", "message": "Fee marked as Paid successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
# --- 4. WARDEN & MESS SECTION ---
@app.get("/warden/stats")
async def get_warden_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("SELECT COUNT(*) FROM Attendance WHERE marked_date = %s AND status = 'Present'", (today,))
        return {"present_today": cursor.fetchone()[0]}
    finally:
        db.close()

@app.get("/warden/attendance")
async def get_warden_attendance():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT a.*, u.username FROM Attendance a JOIN Students s ON a.student_id = s.student_id JOIN Users u ON s.user_id = u.user_id ORDER BY marked_date DESC")
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

# --- 5. STUDENT SECTION ---
@app.get("/student/fees/{student_id}")
async def get_student_fees(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Fees WHERE student_id = %s ORDER BY fee_id DESC", (student_id,))
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/student/mark-attendance")
async def mark_attendance(student_id: int = Form(...), status: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("SELECT * FROM Attendance WHERE student_id = %s AND marked_date = %s", (student_id, today))
        if cursor.fetchone():
            return {"status": "error", "message": "Already marked!"}
        cursor.execute("INSERT INTO Attendance (student_id, marked_date, status) VALUES (%s, %s, %s)", (student_id, today, status))
        db.commit()
        return {"status": "success"}
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

@app.get("/student/notifications")
async def get_notifs():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Notifications ORDER BY created_at DESC LIMIT 10")
        return cursor.fetchall()
    finally:
        db.close()