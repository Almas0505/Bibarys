# Скрипт для создания заглушек рисунков для диплома
# Создает пустые изображения с текстом-описанием

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Создание заглушек для рисунков" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Проверка установки Python
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue

if (-not $pythonInstalled) {
    Write-Host "❌ Python не установлен!" -ForegroundColor Red
    Write-Host "Скачайте: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Создаем папку для изображений
$imagesDir = "images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
    Write-Host "📁 Создана папка: $imagesDir" -ForegroundColor Green
}

# Создаем Python скрипт для генерации изображений
$pythonScript = @"
from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(filename, text, size=(1920, 1080)):
    # Создаем изображение
    img = Image.new('RGB', size, color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    # Пытаемся загрузить шрифт
    try:
        font = ImageFont.truetype('arial.ttf', 48)
        small_font = ImageFont.truetype('arial.ttf', 32)
    except:
        font = ImageFont.load_default()
        small_font = font
    
    # Рисуем рамку
    draw.rectangle([(50, 50), (size[0]-50, size[1]-50)], outline=(100, 100, 100), width=5)
    
    # Центрируем текст
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2 - 50
    
    # Рисуем текст
    draw.text((x, y), text, fill=(50, 50, 50), font=font)
    
    # Добавляем подсказку
    hint = "Замените на реальное изображение"
    hint_bbox = draw.textbbox((0, 0), hint, font=small_font)
    hint_width = hint_bbox[2] - hint_bbox[0]
    hint_x = (size[0] - hint_width) // 2
    draw.text((hint_x, y + 100), hint, fill=(150, 150, 150), font=small_font)
    
    # Сохраняем
    img.save(filename)
    print(f'✅ Создан: {filename}')

# Создаем изображения
images = [
    ('images/suret1_architecture.png', 'СУРЕТ 1\nКлиент-сервер архитектурасы'),
    ('images/suret2_er_diagram.png', 'СУРЕТ 2\nER-диаграмма'),
    ('images/suret3_login.png', 'СУРЕТ 3\nЖүйеге кіру терезесі'),
    ('images/suret4_pos.png', 'СУРЕТ 4\nСатушының жұмыс терезесі'),
    ('images/suret5_swagger.png', 'СУРЕТ 5\nSwagger UI'),
    ('images/suret6_admin.png', 'СУРЕТ 6\nӘкімші панелі')
]

for filename, text in images:
    create_placeholder(filename, text)

print('\n✅ Все заглушки созданы!')
print('📁 Папка: images/')
print('\n💡 Замените их на реальные скриншоты:')
print('   - СУРЕТ 1: Нарисуйте в draw.io')
print('   - СУРЕТ 2: Экспорт из dbdiagram.io')
print('   - СУРЕТ 3-6: Скриншоты приложения')
"@

# Сохраняем Python скрипт
$pythonScript | Out-File -FilePath "create_images.py" -Encoding UTF8

Write-Host "Устанавливаем библиотеку Pillow..." -ForegroundColor Cyan
pip install Pillow --quiet 2>&1 | Out-Null

Write-Host "Создаем изображения..." -ForegroundColor Cyan
Write-Host ""
python create_images.py

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ Готово!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Папка с изображениями: $imagesDir" -ForegroundColor White
Write-Host ""
Write-Host "Следующий шаг:" -ForegroundColor Yellow
Write-Host "1. Замените заглушки на реальные изображения" -ForegroundColor White
Write-Host "2. Запустите: .\convert_to_docx.ps1" -ForegroundColor White
Write-Host ""

# Удаляем временный Python скрипт
Remove-Item "create_images.py" -ErrorAction SilentlyContinue
