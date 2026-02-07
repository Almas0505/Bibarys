"""
Скрипт для удаления всех пользователей из базы данных
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import User

def delete_all_users():
    """Удаление всех пользователей"""
    
    db: Session = SessionLocal()
    
    try:
        # Считаем текущих пользователей
        count = db.query(User).count()
        print(f"📊 В базе найдено пользователей: {count}")
        
        if count == 0:
            print("✅ База уже пустая, нечего удалять")
            return
        
        # Удаляем всех пользователей
        db.query(User).delete()
        db.commit()
        
        print(f"✅ Удалено пользователей: {count}")
        print("🎉 База данных очищена!")
        
    except Exception as e:
        print(f"❌ Ошибка при удалении: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    delete_all_users()
