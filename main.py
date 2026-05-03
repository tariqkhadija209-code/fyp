import os
import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import datetime
import stripe
import joblib 
import pickle

# Model load karein
ml_model = joblib.load('room_allocator.pkl')

# --- ENVIRONMENT VARIABLES LOAD ---
load_dotenv()

app = FastAPI()

# --- ML MODEL LOADING ---
ml_model = joblib.load('room_allocator.pkl')
try:
    priority_model = joblib.load('priority_model.pkl')
    vectorizer = joblib.load('vectorizer.pkl')
    print("AI Models Loaded Successfully!")
except Exception as e:
    print(f"Model Loading Warning: {e}")

# --- STRIPE CONFIGURATION ---

stripe.api_key = os.getenv("STRIPE_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- DATABASE CONNECTION ---

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"), 
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT")),
        ssl_ca="ca.pem",  
        ssl_verify_cert=True
    )

# --- 1. AUTHENTICATION ---
# --- SIGNUP LOGIC ---
@app.post("/signup")
async def signup(
    username: str = Form(...), 
    email: str = Form(...), 
    full_name: str = Form(...), 
    roll_no: str = Form(...), 
    department: str = Form(...), 
    password: str = Form(...)
):
    db = get_db_connection()
    cursor = db.cursor()
    try:

        user_query = "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, 'Student')"
        cursor.execute(user_query, (username, email, password))
        u_id = cursor.lastrowid 

        student_query = """
            INSERT INTO students (user_id, full_name, roll_no, department) 
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(student_query, (u_id, full_name, roll_no, department))
        
        db.commit()
        return {"status": "success", "message": "Registration successful!"}
    except Exception as e:
        db.rollback()
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT user_id, username, role, password_hash FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if user:
            
            if user['password_hash'] == password:
                response_data = {
                    "status": "success",
                    "user_id": user['user_id'],
                    "username": user['username'],
                    "role": user['role']
                }

               
                if user['role'] == 'Student':
                    cursor.execute("SELECT student_id FROM students WHERE user_id = %s", (user['user_id'],))
                    student = cursor.fetchone()
                    if student:
                        response_data["student_id"] = student['student_id']
                
                return response_data
            else:
                raise HTTPException(status_code=401, detail="Wrong Password!")
        else:
            raise HTTPException(status_code=404, detail="Email not found!")
    finally:
        db.close()

# --- 2. STRIPE PAYMENT FLOW UPDATE ---
from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    fee_id: int
    amount: float

@app.post("/student/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest):
    try:
        fee_id = data.fee_id
        amount = data.amount

        if amount <= 0:
            return {"error": "Invalid amount"}

        stripe_amount = int(amount * 100)

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Hostel Fee Payment ID: {fee_id}'
                    },
                    'unit_amount': stripe_amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"/payment-success?fee_id={fee_id}",
            cancel_url="/payment-cancelled",
        )

        return {"url": session.url}

    except Exception as e:
        return {"error": str(e)}





@app.get("/payment-success")
async def payment_success(fee_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    print(f"Payment successful for fee_id: {fee_id}. Updating database..."  )
    try:
        today = datetime.date.today()
        cursor.execute("UPDATE fees SET status = 'Paid', payment_date = %s WHERE fee_id = %s", (today, fee_id))
        db.commit()
        return RedirectResponse(url=f"https://hostelflow-production-e1ce.up.railway.app/student/fees?payment=success&fee_id={fee_id}")
        
    except Exception as e:
        print(f"Database update error: {e}")
        return {"error": str(e)}
    finally:
        db.close()

# --- 3. ADMIN SECTION -------
@app.get("/admin/stats")
async def get_admin_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM hostel_rooms"); total_rooms = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM complaints"); total_complaints = cursor.fetchone()[0]
        cursor.execute("SELECT SUM(amount) FROM fees WHERE status = 'Paid'"); total_revenue = cursor.fetchone()[0] or 0
        return {"total_rooms": total_rooms, "pending_complaints": total_complaints, "total_revenue": float(total_revenue)}
    finally:
        db.close()

@app.get("/admin/rooms")
async def get_rooms():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
       
        cursor.execute("SELECT room_no, block, capacity, current_occupancy, status, wing FROM hostel_rooms")
        return cursor.fetchall()
    finally:
        db.close()



@app.post("/admin/allocate-room-ai/{student_id}")
async def allocate_room_ai(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        
        cursor.execute("SELECT department FROM students WHERE student_id = %s", (student_id,))
        student = cursor.fetchone()
        
        if not student:
            return {"status": "error", "message": "Student record missing!"}

        dept_mapping = {'SNA': 0, 'IT': 1, 'Computing': 2} 
        dept_val = dept_mapping.get(student['department'], 0)
        predicted_block = ml_model.predict([[dept_val]])[0]

        cursor.execute("""
            SELECT room_id FROM hostel_rooms 
            WHERE block = %s AND current_occupancy < capacity 
            LIMIT 1
        """, (predicted_block,))
        room = cursor.fetchone()

        if not room:
            return {"status": "error", "message": f"Block {predicted_block} room is not free!"}

        room_id = room['room_id']

        # --- SYNCHRONIZATION  ---
        
        cursor.execute("""
            INSERT INTO allocations (student_id, room_id, allocation_date) 
            VALUES (%s, %s, CURDATE())
        """, (student_id, room_id))

        cursor.execute("""
            UPDATE hostel_rooms 
            SET current_occupancy = current_occupancy + 1 
            WHERE room_id = %s
        """, (room_id,)) 

      
        db.commit()

        return {
            "status": "success", 
            "message": f"Success! Block {predicted_block} is allocated to the respective student-."
        }
  
    except Exception as e:
        if db:
            db.rollback() 
        print(f"Sync Error: {e}")
        return {"status": "error", "message": f"Data is not saved: {str(e)}"}
    finally:
        if db:
            db.close()

@app.post("/admin/add-room")
async def add_room(
    room_no: str = Form(...), 
    block: str = Form(...), 
    capacity: int = Form(...), 
    wing: str = Form(...) 
):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        
        query = """
            INSERT INTO hostel_rooms (room_no, block, capacity, current_occupancy, status, wing) 
            VALUES (%s, %s, %s, 0, 'Available', %s)
        """
        cursor.execute(query, (room_no, block, capacity, wing))
        db.commit()
        return {"status": "success", "message": "Room added successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()   


@app.get("/admin/pending-students")
async def get_pending_students():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT student_id, full_name, department, gender 
            FROM students 
            WHERE student_id NOT IN (SELECT student_id FROM allocations)
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        db.close()

@app.get("/admin/complaints")
async def get_admin_complaints():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT c.*, s.full_name as student_name 
            FROM complaints c 
            JOIN students s ON c.student_id = s.student_id 
            ORDER BY CASE 
                WHEN c.priority = 'High' THEN 1 
                WHEN c.priority = 'Medium' THEN 2 
                ELSE 3 
            END ASC, c.student_id DESC
        """
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@app.delete("/admin/resolve-complaint/{complaint_id}")
async def resolve_complaint(complaint_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM complaints WHERE complaint_id = %s", (complaint_id,))
        db.commit()
        return {"status": "success", "message": "Complaint resolved successfully!"}
    finally:
        db.close()

@app.post("/admin/generate-fees")
async def generate_fees(billing_month: str = Form(...), amount: float = Form(...)):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # Step 1: Students fetch karein
        query = """
            SELECT s.student_id FROM students s
            JOIN allocations a ON s.student_id = a.student_id
            WHERE a.room_id IS NOT NULL
        """
        cursor.execute(query)
        students = cursor.fetchall()

        if not students:
            return {"status": "error", "message": "No students found with allocated rooms."}

        for s in students:
            insert_query = """
                INSERT INTO fees (student_id, amount, billing_month, status) 
                VALUES (%s, %s, %s, 'Unpaid')
            """
            cursor.execute(insert_query, (s['student_id'], amount, billing_month))
        
        db.commit()
        return {"status": "success", "message": f"{len(students)} students voucher is generated!"}
    except Exception as e:
        print(f"SQL Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@app.get("/admin/get-all-fees")
async def get_all_fees():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT fee_id, student_id, amount, billing_month, status FROM fees ORDER BY fee_id DESC"
        cursor.execute(query)
        fees = cursor.fetchall()
        return fees
    finally:
        db.close()     

@app.get("/admin/fees-summary")
async def fees_summary():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                f.fee_id, 
                s.full_name, 
                f.amount, 
                f.billing_month, 
                f.status 
            FROM fees f
            JOIN students s ON f.student_id = s.student_id
            ORDER BY f.fee_id DESC
        """
        cursor.execute(query)
        fees = cursor.fetchall()
        return fees
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        db.close()

@app.post("/admin/approve-fee/{fee_id}")
async def approve_fee(fee_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today().strftime('%Y-%m-%d')
        cursor.execute("UPDATE fees SET status = 'Paid', payment_date = %s WHERE fee_id = %s", (today, fee_id))
        db.commit()
        return {"status": "success", "message": "Fee marked as Paid."}
    finally:
        db.close()


@app.post("/admin/allocate-room")
async def allocate_room(student_id: int, room_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM allocations WHERE student_id = %s", (student_id,))
        if cursor.fetchone():
            return {"status": "error", "message": "Student already has a room!"}

        query = "INSERT INTO allocations (student_id, room_id, status) VALUES (%s, %s, 'Allocated')"
        cursor.execute(query, (student_id, room_id))

        cursor.execute("UPDATE hostel_rooms SET available_beds = available_beds - 1 WHERE room_id = %s", (room_id,))
        
        db.commit()
        return {"status": "success", "message": "Room Allocated Successfully!"}
    finally:
        db.close()


# --- 4. STUDENT SECTION (AI INTEGRATED) ---
@app.get("/student/fees/{student_id}")
async def get_student_fees(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM fees WHERE student_id = %s ORDER BY fee_id DESC", (student_id,))
        return cursor.fetchall()
    finally:
        db.close()


@app.get("/student/fee-status/{student_id}")
async def get_fee_status(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT status FROM fees WHERE student_id = %s ORDER BY created_at DESC LIMIT 1"
        cursor.execute(query, (student_id,))
        fee_info = cursor.fetchone()

        if fee_info:
            return {"status": "success", "fee_status": fee_info['status']}
        else:
            return {"status": "error", "fee_status": "No Voucher Generated"}
    finally:
        db.close()    


@app.get("/student/fee-history/{student_id}")
async def get_student_fee_history(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT id, month, amount, status FROM fees WHERE student_id = %s"
        cursor.execute(query, (student_id,))
        records = cursor.fetchall()
        return records
    finally:
        db.close()            

@app.post("/student/add-complaint")
async def student_comp(student_id: int = Form(...), type: str = Form(...), desc: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    
    predicted_priority = "Medium" 
    
    try:
        # Step 1: AI Model Check
        try:
            clean_desc = desc.lower().strip()
            input_text = vectorizer.transform([clean_desc])
            predicted_priority = priority_model.predict(input_text)[0]
        except Exception as ai_err:
            print(f"AI Model Error: {ai_err}")
            predicted_priority = "Medium" 

        # Step 2: Database Insert 
        query = """
            INSERT INTO complaints (student_id, complaint_type, description, priority, status) 
            VALUES (%s, %s, %s, %s, 'Unresolved')
        """
        cursor.execute(query, (student_id, type, desc, predicted_priority))
        db.commit()
        
        print("Success: Complaint saved in database!")
        return {"status": "success", "detected_priority": predicted_priority}

    except Exception as e:
        db.rollback() 
        print(f"Database Crash Error: {e}") 
        return {"status": "error", "message": f"Database Error: {str(e)}"}
    finally:
        db.close()

@app.post("/student/mark-attendance")
async def mark_attendance(student_id: int = Form(...), status: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        query = "INSERT INTO attendance (student_id, status, marked_date) VALUES (%s, %s, CURDATE())"
        cursor.execute(query, (student_id, status))
        db.commit()
        return {"status": "success", "message": "attendance marked!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@app.get("/student/room-details/{student_id}")
async def get_room_details(student_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT hr.room_no, hr.block, hr.wing 
            FROM allocations a 
            JOIN hostel_rooms hr ON a.room_id = hr.room_id 
            WHERE a.student_id = %s
        """
        cursor.execute(query, (student_id,))
        result = cursor.fetchone()

        if result:
            return {
                "status": "success", 
                "room_no": result['room_no'], 
                "block": result['block'], 
                "wing": result['wing']
            }
        else:
            return {"status": "error", "message": "No room allotted for this student_id"}
    finally:
        db.close()

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        # 1. Check allocation for the student
        query = """
            SELECT hr.room_no, hr.block, hr.wing, a.room_id 
            FROM allocations a 
            JOIN hostel_rooms hr ON a.room_id = hr.room_id 
            WHERE a.student_id = %s
        """
        cursor.execute(query, (student_id,))
        room_data = cursor.fetchone()

        if not room_data:
            return {"status": "error", "message": "No room allotted"}
    finally:
        db.close()

@app.get("/student/suggest-room/{department}")
async def suggest_room(department: str):
    # AI Prediction Logic
    department_id = 0 if department == "SNA" else 1 # Simple check
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    query = "SELECT * FROM hostel_rooms WHERE block = 'A' AND current_occupancy < capacity LIMIT 1"
    cursor.execute(query)
    room = cursor.fetchone()
    
    db.close()
    return {"suggested_room": room}


# --- 5. WARDEN & MESS SECTION (RESTORED) ---
@app.get("/warden/stats")
async def get_warden_stats():
    db = get_db_connection()
    cursor = db.cursor()
    try:
        today = datetime.date.today()
        cursor.execute("SELECT COUNT(*) FROM attendance WHERE marked_date = %s AND status = 'Present'", (today,))
        count = cursor.fetchone()[0]
        return {"present_today": count}
    finally:
        db.close()

@app.get("/warden/attendance")
async def get_warden_attendance():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT s.full_name, a.status, a.marked_date 
            FROM attendance a 
            JOIN students s ON a.student_id = s.student_id 
            ORDER BY a.marked_date DESC
        """
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(f"Database Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@app.get("/warden/menu")
async def get_menu():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM mess_menu")
        return cursor.fetchall()
    finally:
        db.close()

@app.post("/warden/send-notification")
async def send_notification(title: str = Form(...), message: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        
        query = "INSERT INTO notifications (title, message) VALUES (%s, %s)"
        cursor.execute(query, (title, message))
        db.commit()
        return {"status": "success", "message": "Notification sent to all students!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()        

@app.post("/warden/update-mess")
async def update_mess(day: str = Form(...), type: str = Form(...), dish: str = Form(...)):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO mess_menu (day_of_week, meal_type, dish_name) VALUES (%s, %s, %s)", (day, type, dish))
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

# --- 6. notifications SECTION (RESTORED) ---
@app.get("/student/notifications")
async def get_notifs():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10")
        return cursor.fetchall()
    except:
        return [] 
    finally:
        db.close()    

import google.generativeai as genai
from fastapi import FastAPI, Request

import os
from dotenv import load_dotenv
import google.generativeai as genai

# .env file se variables load karne ke liye
load_dotenv()

# API Key ab environment variable se aaye gi
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Model configuration
gemini_model = genai.GenerativeModel('gemini-2.5-flash-pro')

@app.post("/chatbot")
async def hostel_bot(request: Request):
    try:
        data = await request.json()
        user_msg = data.get("message", "")
        
        print(f"User Message: {user_msg}")

        prompt = (
            f"Context: You are the HostelFlow AI Assistant. "
            f"Instructions: Answer concisely and politely. "
            f"IMPORTANT: Respond in the SAME language the user used. "
            f"User Question: {user_msg}"
        )
        
        response = gemini_model.generate_content(prompt)
        
        if response.text:
            return {"reply": response.text}
        else:
            return {"reply": "I received your message but couldn't generate a specific answer. Please try again."}
            
    except Exception as e:
        print(f"Backend Error: {e}")
        return {"reply": "Sorry, I am having a connection issue with my AI brain. Please check your internet or API key."}
