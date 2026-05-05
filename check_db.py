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
ALTER TABLE complaints
MODIFY status VARCHAR(50);
""")

# Save changes
connection.commit()

print(" Table 'attendance' created successfully (or already exists).")

# Optional: Show tables in DB
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()

print("\n📂 Tables in database:")
for t in tables:
    print(t[0])

# Cleanup
cursor.close()
connection.close()