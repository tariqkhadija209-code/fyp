import os
import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI,Request, Form, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import datetime
import stripe
import joblib 
import pickle
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, List

import google.generativeai as genai
from google.genai import types
import ollama



import google.generativeai as genai
from google.genai import types

# .env file se variables load karne ke liye
load_dotenv()

# API Key ab environment variable se aaye gi
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Model configuratio
gemini_model = genai.GenerativeModel('veo-2.0-generate-001')
from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
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

# --- SECURITY CONFIGURATION ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-it")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        if username is None:
            raise credentials_exception
        return {"username": username, "role": role, "user_id": user_id}
    except JWTError:
        raise credentials_exception

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        if user["role"] not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return user

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"), 
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT")),
        ssl_ca="ca.pem",
        ssl_disabled=False,  
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
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(data: LoginRequest):
    email = data.email
    password = data.password
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = "SELECT user_id, username, role, password_hash FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if user:
            # Simple password check (user is currently storing plain passwords based on main.py line 68)
            # If they move to hashed passwords later, use pwd_context.verify(password, user['password_hash'])
            if user['password_hash'] == password:
                access_token = create_access_token(
                    data={"sub": user['username'], "role": user['role'], "user_id": user['user_id']}
                )
                
                response_data = {
                    "status": "success",
                    "access_token": access_token,
                    "token_type": "bearer",
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
            success_url=f"https://talkify.app/payment-success?fee_id={fee_id}",
            cancel_url="https://talkify.app/payment-cancelled",
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
        return RedirectResponse(url=f"https://fyp-phi-blue.vercel.app/student/fees")
        
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

@app.get("/admin/rooms", )
async def get_rooms():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
       
        cursor.execute("SELECT room_no, block, capacity, current_occupancy, status, wing FROM hostel_rooms")
        return cursor.fetchall()
    finally:
        db.close()



@app.post("/admin/allocate-room-ai/{student_id}", )
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

@app.post("/admin/add-room", )
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


@app.get("/admin/pending-students", )
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

@app.get("/admin/complaints", )
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

@app.delete("/admin/resolve-complaint/{complaint_id}", )
async def resolve_complaint(complaint_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM complaints WHERE complaint_id = %s", (complaint_id,))
        db.commit()
        return {"status": "success", "message": "Complaint resolved successfully!"}
    finally:
        db.close()

@app.post("/admin/generate-fees", )
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

@app.get("/admin/get-all-fees", )
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

@app.get("/admin/fees-summary", )
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

@app.post("/admin/approve-fee/{fee_id}", )
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


@app.post("/admin/allocate-room", )
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

@app.get("/student/attendance-status/{student_id}")
async def check_attendance_status(student_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        query = "SELECT status FROM attendance WHERE student_id = %s AND marked_date = CURDATE() LIMIT 1"
        cursor.execute(query, (student_id,))
        record = cursor.fetchone()
        if record:
            return {"status": "success", "is_marked": True}
        return {"status": "success", "is_marked": False}
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
@app.get("/warden/stats", dependencies=[Depends(RoleChecker(["Warden", "Admin"]))])
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

@app.get("/warden/attendance", dependencies=[Depends(RoleChecker(["Warden", "Admin"]))])
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

@app.post("/warden/send-notification", dependencies=[Depends(RoleChecker(["Warden", "Admin"]))])
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

@app.post("/warden/update-mess", dependencies=[Depends(RoleChecker(["Warden", "Admin"]))])
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

async def generate_reply(prompt):
    models = ["gemini-2.5-flash", "gemini-2.0-flash"]
    
    for model in models:
        for attempt in range(3):  # retry 3 times
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                if response.text:
                    return response.text
            except Exception as e:
                print(f"{model} attempt {attempt+1} failed: {e}")
                await asyncio.sleep(2)

    return None


# --- CHATBOT DATABASE TOOLS ---
def db_get_student_info(student_id: int):
    
    """Fetches general profile information for a student including name, roll number, and department."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT full_name, roll_no, department, gender FROM students WHERE student_id = %s", (student_id,))
        return cursor.fetchone()
    finally:
        db.close()

def db_get_room_details(student_id: int):
    """Fetches room allocation details for a specific student."""
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
        return cursor.fetchone()
    finally:
        db.close()

def db_get_fee_status(student_id: int):
    """Fetches fee records and payment status for a specific student."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT amount, billing_month, status, payment_date FROM fees WHERE student_id = %s ORDER BY fee_id DESC", (student_id,))
        return cursor.fetchall()
    finally:
        db.close()

def db_get_mess_menu(day: str):
    """Fetches the mess menu for a specific day of the week (e.g., Monday, Tuesday)."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT meal_type, dish_name FROM mess_menu WHERE day_of_week = %s", (day,))
        return cursor.fetchall()
    finally:
        db.close()

def db_get_latest_notifications():
    """Fetches the latest notifications and announcements for students."""
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT title, message, created_at FROM notifications ORDER BY created_at DESC LIMIT 5")
        return cursor.fetchall()
    finally:
        db.close()

# List of tools for Gemini
hostel_tools = [
    db_get_student_info,
    db_get_room_details,
    db_get_fee_status,
    db_get_mess_menu,
    db_get_latest_notifications
]


@app.post("/chatbot")
async def hostel_bot(request: Request):
    try:
        data = await request.json()
        user_msg = data.get("message", "").strip()
        student_id = data.get("studentId")

        if not user_msg:
            return {"reply": "Please send a message."}

        print(f"User Message: {user_msg}, Student ID: {student_id}")

        # Construct System Instructions with User Context
        current_day = datetime.datetime.now().strftime("%A")
        system_instruction = (
            "You are the HostelFlow AI Assistant. You help students with their hostel-related queries.\n"
            "You have access to tools that can query the database for real-time information.\n"
            "INSTRUCTIONS:\n"
            "1. Answer concisely and politely.\n"
            "2. Respond in the SAME language the user used (Urdu/Hindi/English).\n"
            f"3. CURRENT USER CONTEXT: The student currently asking has student_id = {student_id}.\n"
            "   - If the user asks about 'my room', 'my fees', or 'my profile', use this ID.\n"
            "   - If student_id is null/missing, tell them to log in to see personal details.\n"
            f"4. TODAY IS: {current_day}.\n"
            "   - If the user asks for 'today's menu' or just 'menu' without specifying a day, assume it's for today and use the db_get_mess_menu tool.\n"
            "5. Always prioritize using the provided tools to get accurate data."
        )
        models = ["gemini-2.5-flash", "gemini-2.0-flash"]
        # Use the official SDK with automatic function calling
        response = client.models.generate_content(
            model=models[0],
            contents=user_msg,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=hostel_tools,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=False)
            )
        )

        reply = response.text if response.text else "I'm sorry, I couldn't process that request."
        
        return {"reply": reply}

    except Exception as e:
        print(f"Backend Error: {e}")
        return {"reply": "An error occurred while processing your request. Please try again later."}