"""
Показывает абсолютный путь к файлу базы данных
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

print("=" * 70)
print("📍 ПУТЬ К БАЗЕ ДАННЫХ:")
print("=" * 70)
print(f"\n{settings.DATABASE_URL}\n")
print("=" * 70)
print("✅ Теперь база данных ВСЕГДА будет в этом месте,")
print("   независимо от того, откуда вы запускаете backend!")
print("=" * 70)
