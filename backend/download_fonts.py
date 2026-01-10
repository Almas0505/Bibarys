"""
Download DejaVu Sans font for PDF generation with Cyrillic support
"""
import urllib.request
import zipfile
import os
import shutil

def download_and_install_fonts():
    """Download and extract DejaVu fonts"""
    print("Скачиваем шрифт DejaVu Sans...")
    
    # URL шрифта
    font_url = "https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.zip"
    zip_path = "dejavu-fonts.zip"
    extract_path = "dejavu-fonts"
    
    try:
        # Скачиваем
        urllib.request.urlretrieve(font_url, zip_path)
        print("✓ Шрифт скачан")
        
        # Распаковываем
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        print("✓ Шрифт распакован")
        
        # Ищем файлы шрифтов
        for root, dirs, files in os.walk(extract_path):
            for file in files:
                if file == "DejaVuSans.ttf" or file == "DejaVuSans-Bold.ttf":
                    src = os.path.join(root, file)
                    # Копируем в директорию Windows Fonts
                    dst = f"C:/Windows/Fonts/{file}"
                    try:
                        shutil.copy2(src, dst)
                        print(f"✓ Скопирован {file} в C:/Windows/Fonts/")
                    except PermissionError:
                        # Если нет прав, копируем в текущую папку
                        local_dst = os.path.join(os.path.dirname(__file__), file)
                        shutil.copy2(src, local_dst)
                        print(f"✓ Скопирован {file} в {local_dst}")
        
        # Удаляем временные файлы
        os.remove(zip_path)
        shutil.rmtree(extract_path)
        print("✓ Временные файлы удалены")
        
        print("\n✅ Установка завершена! Теперь PDF будет корректно отображать кириллицу.")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        print("\nАльтернативное решение: используем системный шрифт Arial")
        print("PDF будет работать с Arial, который уже установлен в Windows")

if __name__ == "__main__":
    download_and_install_fonts()
