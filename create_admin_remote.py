from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, User
from backend.auth import pwd_context
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRES_PRISMA_URL")
    or os.getenv("POSTGRES_URL_NON_POOLING")
    or os.getenv("NEON_DATABASE_URL")
)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin():
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating admin user...")
            hashed_password = pwd_context.hash("Admin@123")
            admin_user = User(
                username="admin",
                email="admin@elwakel.com",
                hashed_password=hashed_password,
                is_active=True,
                is_admin=True,
                phone_number="0000000000"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully!")
        else:
            print("Admin user already exists.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
