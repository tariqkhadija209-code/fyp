import mysql.connector 
import os
from dotenv import load_dotenv

# .env file se variables load karne ke liye
load_dotenv()

connection = mysql.connector.connect(
    host='mysql-30087cb5-hostelflow-db.l.aivencloud.com',
    port=10924,
    user='avnadmin',
    password=os.getenv("DB_PASSWORD"),  # Aapka Aiven Password Yahan Likhein
    database='defaultdb',
    ssl_ca='ca.pem'
)

cursor = connection.cursor()
cursor.execute("SHOW TABLES;")
tables = cursor.fetchall()

print("Cloud Database mein ye tables hain:")
for t in tables:
    print(t)

connection.close()