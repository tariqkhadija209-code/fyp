import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

connection = mysql.connector.connect(
    host='mysql-30087cb5-hostelflow-db.l.aivencloud.com',
    port=10924,
    user='avnadmin',
    password=os.getenv("DB_PASSWORD"),
    database='defaultdb',
    ssl_ca='ca.pem'
)

cursor = connection.cursor()

# Create table
cursor.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    status ENUM('Present','Absent') DEFAULT 'Present',
    marked_date DATE
)
""")

# Save changes
connection.commit()

print("✅ Table 'attendance' created successfully (or already exists).")

# Optional: Show tables in DB
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()

print("\n📂 Tables in database:")
for t in tables:
    print(t[0])

# Cleanup
cursor.close()
connection.close()