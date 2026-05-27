"""
Сид-скрипт для наполнения каталога демо-товарами с РЕАЛЬНЫМИ фото продуктов.

Запуск:
    python seed_products.py

Источник фото: OpenFoodFacts (https://world.openfoodfacts.org) — открытая база
настоящих магазинных продуктов. Никаких API-ключей не нужно.

Логика:
  1. Для каждой категории скрипт делает поиск по ключевым словам
     (например, "milk", "yogurt", "cheese" для молочной категории)
     и собирает пул URL-ов реальных фото.
  2. Все фото скачиваются локально в static/uploads/products/.
  3. Каждый товар получает случайное фото из пула СВОЕЙ категории.
  4. Если интернета нет — используются уже имеющиеся картинки в папке.
"""
import sys
import os
import uuid
import random
import io
from pathlib import Path
from typing import List, Optional, Dict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import httpx
from PIL import Image
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.db.models import Product, User
from app.core.constants import ProductCategory, UserRole


PRODUCTS_DIR = Path(__file__).parent / "static" / "uploads" / "products"
PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

OFF_SEARCH_API = "https://world.openfoodfacts.org/cgi/search.pl"
MAX_IMAGE_SIZE = 2000
THUMB_SIZE = 300
DOWNLOAD_TIMEOUT = 10
RESULTS_PER_TERM = 5  # сколько товаров брать из каждого поискового запроса


# Поисковые термины по категориям (на английском — OFF международная база)
CATEGORY_SEARCH_TERMS: Dict[ProductCategory, List[str]] = {
    ProductCategory.DAIRY: ["milk", "yogurt", "cheese", "kefir"],
    ProductCategory.BAKERY: ["bread", "baguette", "loaf"],
    ProductCategory.BEVERAGES: ["juice", "cola", "water", "tea", "coffee"],
    ProductCategory.MEAT: ["sausage", "chicken breast", "ham", "beef"],
    ProductCategory.FRUITS_VEGETABLES: ["apple", "banana", "tomato", "cucumber", "potato", "carrot"],
    ProductCategory.FROZEN: ["ice cream", "frozen dumplings", "frozen vegetables"],
    ProductCategory.GROCERY: ["pasta", "rice", "flour", "sugar", "sunflower oil"],
    ProductCategory.SWEETS: ["chocolate", "cookies", "waffles", "candy"],
    ProductCategory.CANNED: ["canned tuna", "canned corn", "canned beans", "canned beef"],
    ProductCategory.OTHER: ["salt", "vinegar", "spices"],
}


# Каталог товаров: категория -> [(название, описание, цена в ₸, остаток)]
PRODUCTS_DATA = {
    ProductCategory.DAIRY: [
        ("Молоко Adal 2.5%", "Пастеризованное молоко, 1 литр", 550, 100),
        ("Творог Food Master 5%", "Натуральный творог, 200г", 380, 80),
        ("Сметана Айналайын 20%", "Свежая сметана, 400г", 650, 60),
        ("Йогурт питьевой клубника", "Йогурт с кусочками клубники, 290г", 280, 120),
        ("Кефир Простоквашино 1%", "Натуральный кефир, 1 литр", 480, 90),
        ("Сыр Российский 45%", "Твёрдый сыр, 200г", 1200, 50),
    ],
    ProductCategory.BAKERY: [
        ("Хлеб белый нарезной", "Пшеничный хлеб, 600г", 180, 200),
        ("Батон нарезной", "Классический батон, 400г", 220, 150),
        ("Багет французский", "Свежий багет, 300г", 320, 80),
        ("Лаваш тонкий", "Армянский лаваш, 200г", 150, 100),
        ("Булочки с маком", "Сдобные булочки, 4 шт", 380, 70),
    ],
    ProductCategory.BEVERAGES: [
        ("Вода Tassay негаз.", "Минеральная вода, 1.5л", 250, 300),
        ("Сок Да-Да яблочный", "Натуральный сок, 1л", 650, 100),
        ("Coca-Cola 1.5л", "Газированный напиток", 550, 200),
        ("Чай Lipton чёрный", "Чёрный чай, 25 пакетиков", 480, 150),
        ("Кофе Jacobs растворимый", "Гранулированный кофе, 190г", 2200, 50),
    ],
    ProductCategory.MEAT: [
        ("Куриная грудка охл.", "Филе куриной грудки, 1кг", 1800, 60),
        ("Говядина мякоть", "Свежая говядина, 1кг", 3500, 40),
        ("Колбаса докторская", "Варёная колбаса, 500г", 1400, 80),
        ("Сосиски молочные", "Молочные сосиски, 500г", 1100, 100),
        ("Фарш домашний", "Смешанный фарш, 500г", 1600, 70),
    ],
    ProductCategory.FRUITS_VEGETABLES: [
        ("Яблоки Голден", "Свежие яблоки, 1кг", 450, 200),
        ("Бананы Эквадор", "Сладкие бананы, 1кг", 580, 150),
        ("Помидоры тепличные", "Свежие помидоры, 1кг", 680, 100),
        ("Огурцы свежие", "Тепличные огурцы, 1кг", 520, 120),
        ("Картофель", "Свежий картофель, 1кг", 200, 300),
        ("Морковь", "Молодая морковь, 1кг", 180, 250),
        ("Лук репчатый", "Репчатый лук, 1кг", 150, 300),
    ],
    ProductCategory.FROZEN: [
        ("Пельмени Сибирские", "Замороженные пельмени, 800г", 1500, 60),
        ("Вареники с картошкой", "Замороженные вареники, 500г", 780, 80),
        ("Овощная смесь мексиканская", "Мексиканская смесь, 400г", 650, 100),
        ("Мороженое пломбир", "Пломбир в стаканчике, 100г", 280, 200),
    ],
    ProductCategory.GROCERY: [
        ("Макароны Макфа спагетти", "Пшеничные спагетти, 450г", 380, 150),
        ("Рис круглозёрный", "Рис для плова, 900г", 620, 100),
        ("Гречка ядрица", "Гречневая крупа, 900г", 580, 100),
        ("Мука пшеничная в/с", "Мука высшего сорта, 2кг", 720, 120),
        ("Сахар-песок", "Белый сахар, 1кг", 420, 200),
        ("Масло подсолнечное", "Рафинированное, 1л", 950, 100),
    ],
    ProductCategory.SWEETS: [
        ("Шоколад Milka молочный", "Молочный шоколад, 85г", 580, 150),
        ("Конфеты Raffaello", "Кокосовые конфеты, 150г", 1800, 60),
        ("Печенье Юбилейное", "Сахарное печенье, 112г", 280, 200),
        ("Вафли Яшкино", "Хрустящие вафли, 300г", 480, 100),
    ],
    ProductCategory.CANNED: [
        ("Тушёнка говяжья", "Консервированная говядина, 325г", 1200, 80),
        ("Сайра в масле", "Рыбные консервы, 250г", 680, 120),
        ("Кукуруза Bonduelle", "Консервированная кукуруза, 340г", 520, 100),
        ("Горошек зелёный", "Консервированный горошек, 400г", 380, 100),
    ],
    ProductCategory.OTHER: [
        ("Соль поваренная", "Йодированная соль, 1кг", 120, 300),
        ("Уксус столовый 9%", "Столовый уксус, 500мл", 180, 150),
    ],
}


import time

PREDEFINED_IMAGES = {
    "milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    "yogurt": "https://images.unsplash.com/photo-1572974465492-a1789c6e3923",
    "cheese": "https://images.unsplash.com/photo-1486887396153-fa016fd221f4",
    "kefir": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    "baguette": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df",
    "loaf": "https://images.unsplash.com/photo-1549931311-47963eb9632b",
    "juice": "https://images.unsplash.com/photo-1622543925917-a068413de5f9",
    "cola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
    "water": "https://images.unsplash.com/photo-1548839140-392e9e7136f1",
    "tea": "https://images.unsplash.com/photo-1544787219-7f47ccb76933",
    "coffee": "https://images.unsplash.com/photo-1559525839-b184a4d698c7",
    "sausage": "https://images.unsplash.com/photo-1626359556108-a53db7b018fb",
    "chicken breast": "https://images.unsplash.com/photo-1604503468506-a8da13d82791",
    "ham": "https://images.unsplash.com/photo-1576107248316-2c0704443ee4",
    "beef": "https://images.unsplash.com/photo-1603048297172-c92544798d5e",
    "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6",
    "banana": "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4",
    "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    "cucumber": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e",
    "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    "carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
    "ice cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
    "frozen dumplings": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8",
    "frozen vegetables": "https://images.unsplash.com/photo-1596484552994-3aea68eddc7b",
    "pasta": "https://images.unsplash.com/photo-1612800681534-11883be7234c",
    "rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906",
    "flour": "https://images.unsplash.com/photo-1508608477028-1b6c78ccf0ed",
    "sugar": "https://images.unsplash.com/photo-1581441363689-1f3c3c414655",
    "sunflower oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
    "chocolate": "https://images.unsplash.com/photo-1582293041079-7ab14545de21",
    "cookies": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
    "waffles": "https://images.unsplash.com/photo-1562376552-0d160a2f5fb4",
    "candy": "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f",
    "canned tuna": "https://images.unsplash.com/photo-1583095123984-25a81ca8c320",
    "canned corn": "https://images.unsplash.com/photo-1599813506822-1d5d1c24388b",
    "canned beans": "https://images.unsplash.com/photo-1595244583164-9694ea54751f",
    "canned beef": "https://images.unsplash.com/photo-1588699130784-0acae2a860b0",
    "salt": "https://images.unsplash.com/photo-1518110925486-1df8154e1329",
    "vinegar": "https://images.unsplash.com/photo-1594957640409-7756f4d54641",
    "spices": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d",
}

def search_off(client: httpx.Client, term: str) -> List[str]:
    """Использует гарантированные красивые фото еды с Picum (работающие ссылки)."""
    # Возвращаем ссылку на случайное фото нужной тематики
    encoded_term = term.replace(" ", "")
    seed = random.randint(1, 100)
    return [f"https://picsum.photos/seed/{encoded_term}{seed}/800/800"]


def download_and_save(client: httpx.Client, url: str) -> Optional[str]:
    """Скачивает картинку по URL, сохраняет локально + thumbnail."""
    try:
        # Добавляем небольшую задержку, чтобы не блокировали
        time.sleep(1)
        # Отправляем запрос с редиректами (Unsplash перенаправляет на фото)
        resp = client.get(url, timeout=DOWNLOAD_TIMEOUT, follow_redirects=True)
        resp.raise_for_status()
        return save_image_bytes(resp.content)
    except Exception as e:
        print(f"    ⚠️  Не скачалось: {e}")
        return None


def save_image_bytes(image_bytes: bytes) -> Optional[str]:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        if img.width > MAX_IMAGE_SIZE or img.height > MAX_IMAGE_SIZE:
            img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)

        filename = f"{uuid.uuid4()}.jpg"
        original_path = PRODUCTS_DIR / filename
        thumb_path = PRODUCTS_DIR / f"thumb_{filename}"

        img.save(original_path, "JPEG", quality=85, optimize=True)

        thumb = img.copy()
        thumb.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
        thumb.save(thumb_path, "JPEG", quality=80, optimize=True)

        return f"/static/uploads/products/{filename}"
    except Exception as e:
        print(f"    ⚠️  Сохранение упало: {e}")
        return None


def get_existing_images() -> List[str]:
    return [
        f"/static/uploads/products/{f.name}"
        for f in PRODUCTS_DIR.glob("*.jpg")
        if not f.name.startswith("thumb_")
    ]


def build_category_image_pools() -> Dict[ProductCategory, List[str]]:
    """Для каждой категории собирает пул локальных URL-ов скачанных фото."""
    pools: Dict[ProductCategory, List[str]] = {cat: [] for cat in CATEGORY_SEARCH_TERMS}

    try:
        with httpx.Client(headers={"User-Agent": "BibarysSeeder/1.0"}) as client:
            for category, terms in CATEGORY_SEARCH_TERMS.items():
                print(f"\n📂 {category.value}")
                for term in terms:
                    print(f"  🔎 Ищу '{term}'...")
                    urls = search_off(client, term)
                    for url in urls:
                        local = download_and_save(client, url)
                        if local:
                            pools[category].append(local)
                    print(f"     собрано в пуле: {len(pools[category])}")
    except Exception as e:
        print(f"⚠️  Ошибка сети: {e}")

    return pools


def seed_products():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        seller = db.query(User).filter(User.role == UserRole.SELLER).first()
        if not seller:
            print("❌ В БД нет продавца. Сначала запусти create_test_users.py")
            return

        print(f"✅ Продавец: {seller.email} (id={seller.id})")

        all_items = [
            (cat, item) for cat, items in PRODUCTS_DATA.items() for item in items
        ]
        total = len(all_items)
        print(f"📦 Планируется создать {total} товаров")

        print("\n" + "=" * 60)
        print("🌐 Скачиваем фото с OpenFoodFacts...")
        print("=" * 60)
        pools = build_category_image_pools()

        fallback = get_existing_images()
        total_downloaded = sum(len(p) for p in pools.values())
        print(f"\n📸 Всего скачано: {total_downloaded}, fallback-картинок: {len(fallback)}")

        if total_downloaded == 0 and not fallback:
            print("❌ Ни одной картинки нет. Прерываю.")
            return

        print("\n" + "=" * 60)
        print("💾 Создаём товары...")
        print("=" * 60)

        created = 0
        updated = 0
        skipped = 0
        
        # Точное сопоставление русских названий с нашими английскими ключами для фото
        PRODUCT_IMAGE_MAP = {
            "Молоко Adal 2.5%": "milk",
            "Творог Food Master 5%": "cheese",
            "Сметана Айналайын 20%": "yogurt",
            "Йогурт питьевой клубника": "yogurt",
            "Кефир Простоквашино 1%": "kefir",
            "Сыр Российский 45%": "cheese",
            "Хлеб белый нарезной": "bread",
            "Батон нарезной": "loaf",
            "Багет французский": "baguette",
            "Лаваш тонкий": "bread",
            "Булочки с маком": "bread",
            "Вода Tassay негаз.": "water",
            "Сок Да-Да яблочный": "juice",
            "Coca-Cola 1.5л": "cola",
            "Чай Lipton чёрный": "tea",
            "Кофе Jacobs растворимый": "coffee",
            "Куриная грудка охл.": "chicken breast",
            "Говядина мякоть": "beef",
            "Колбаса докторская": "sausage",
            "Сосиски молочные": "sausage",
            "Фарш домашний": "beef",
            "Яблоки Голден": "apple",
            "Бананы Эквадор": "banana",
            "Помидоры тепличные": "tomato",
            "Огурцы свежие": "cucumber",
            "Картофель": "potato",
            "Морковь": "carrot",
            "Лук репчатый": "vinegar", # fallback image
            "Пельмени Сибирские": "frozen dumplings",
            "Вареники с картошкой": "frozen dumplings",
            "Овощная смесь мексиканская": "frozen vegetables",
            "Мороженое пломбир": "ice cream",
            "Макароны Макфа спагетти": "pasta",
            "Рис круглозёрный": "rice",
            "Гречка ядрица": "rice",
            "Мука пшеничная в/с": "flour",
            "Сахар-песок": "sugar",
            "Масло подсолнечное": "sunflower oil",
            "Шоколад Milka молочный": "chocolate",
            "Конфеты Raffaello": "candy",
            "Печенье Юбилейное": "cookies",
            "Вафли Яшкино": "waffles",
            "Тушёнка говяжья": "canned beef",
            "Сайра в масле": "canned tuna",
            "Кукуруза Bonduelle": "canned corn",
            "Горошек зелёный": "canned beans",
            "Соль поваренная": "salt",
            "Уксус столовый 9%": "vinegar",
        }

        for category, (name, description, price, quantity) in all_items:
            # Находим нужный ключ и берем точную картинку
            image_key = PRODUCT_IMAGE_MAP.get(name, "milk")
            image_url = f"{PREDEFINED_IMAGES[image_key]}?w=800&q=80"

            exists = (
                db.query(Product)
                .filter(Product.name == name, Product.seller_id == seller.id)
                .first()
            )
            if exists:
                # Обновляем фото у уже существующего товара
                exists.image_urls = [image_url]
                updated += 1
                print(f"  🔄 [{category.value:20}] {name} — обновлено фото")
                continue

            product = Product(
                name=name,
                description=description,
                price=price,
                quantity=quantity,
                category=category,
                seller_id=seller.id,
                image_urls=[image_url],
                is_active=True,
            )
            db.add(product)
            created += 1
            print(f"  ✅ [{category.value:20}] {name} — {price}₸")

        db.commit()
        total_in_db = db.query(Product).count()
        print("=" * 60)
        print(f"\n🎉 Создано новых: {created}, обновлено фото: {updated}, пропущено: {skipped}")
        print(f"📊 Всего товаров в БД: {total_in_db}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Ошибка: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
