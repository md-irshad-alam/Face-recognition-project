import mysql.connector
try:
    conn = mysql.connector.connect(host='localhost', database='smart_school', user='root', password='Irshad12')
    cursor = conn.cursor()
    columns_to_add = [
        ("department", "VARCHAR(100)"),
        ("bio", "TEXT"),
        ("office_days", "VARCHAR(100)"),
        ("office_time", "VARCHAR(100)"),
        ("assigned_classes", "TEXT"),
        ("notifications", "TEXT")
    ]
    cursor.execute("DESCRIBE teachers")
    existing_cols = [row[0] for row in cursor.fetchall()]
    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE teachers ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name}")
    conn.commit()
    print("Schema patched successfully.")
except Exception as e:
    print("Error:", e)
