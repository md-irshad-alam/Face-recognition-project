
import database

def apply_schema():
    conn = database.create_connection()
    cursor = conn.cursor()
    try:
        # Read the schema file
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
        
        # Split by semicolon and execute each statement
        statements = schema_sql.split(';')
        for statement in statements:
            if statement.strip():
                cursor.execute(statement)
        conn.commit()
        print("Schema applied successfully.")
    except Exception as e:
        print(f"Error applying schema: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    apply_schema()
