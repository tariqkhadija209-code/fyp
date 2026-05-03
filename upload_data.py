import mysql.connector

config = {
    # Humne hostname ki jagah direct IP (64.227.140.137) use kiya hai
    'host': '64.227.140.137', 
    'user': 'avnadmin',
    'password': 'AVNS_6obvrB9lEolqjownehj',
    'database': 'defaultdb',
    'port': 10924,
    'ssl_ca': 'ca.pem'
}

def upload_data():
    try:
        print("Connecting directly to IP 64.227.140.137...")
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        # Primary key ka masla hal karne ke liye
        cursor.execute("SET SESSION sql_require_primary_key = 0;")
        
        with open('hostelflow.sql', 'r', encoding='utf-8') as f:
            sql_file = f.read()

        commands = sql_file.split(';')
        print("Uploading tables...")
        
        for command in commands:
            clean_cmd = command.strip()
            if not clean_cmd or any(x in clean_cmd.upper() for x in ["CREATE DATABASE", "USE "]):
                continue
            try:
                cursor.execute(clean_cmd)
            except Exception as e:
                # Agar table pehle se bana ho to error skip karega
                continue

        conn.commit()
        print("\n--- CHECKING RESULTS ---")
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        
        if tables:
            print("Mubarak ho Khadija! Ye tables ab Aiven par hain:")
            for t in tables:
                print(f"-> {t[0]}")
        else:
            print("Connection to ho gaya lekin tables nahi banay.")

        conn.close()
    except Exception as err:
        print(f"Connection Error: {err}")

upload_data()