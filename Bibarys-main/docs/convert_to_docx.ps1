# Скрипт для конвертации Markdown в DOCX с правильным форматированием
# Использует Pandoc

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Конвертация диплома в DOCX" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Проверка установки Pandoc
$pandocInstalled = Get-Command pandoc -ErrorAction SilentlyContinue

if (-not $pandocInstalled) {
    Write-Host ""
    Write-Host "❌ Pandoc не установлен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Pandoc:" -ForegroundColor Yellow
    Write-Host "1. Скачайте: https://github.com/jgm/pandoc/releases/latest" -ForegroundColor White
    Write-Host "2. Установите .msi файл" -ForegroundColor White
    Write-Host "3. Перезапустите PowerShell" -ForegroundColor White
    Write-Host ""
    Write-Host "Или через Chocolatey:" -ForegroundColor Yellow
    Write-Host "   choco install pandoc" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Pandoc найден: $($pandocInstalled.Version)" -ForegroundColor Green
Write-Host ""

# Создаем папку для результатов
$outputDir = "output_docx"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "📁 Создана папка: $outputDir" -ForegroundColor Green
}

# Список файлов для конвертации
$files = @(
    "01_КІРІСПЕ.md",
    "02_ТАЛДАМАЛЫҚ_БӨЛІМ.md",
    "03_ЖОБАЛЫҚ_БӨЛІМ.md",
    "04_ПРАКТИКАЛЫҚ_БӨЛІМ.md",
    "05_ҚОРЫТЫНДЫ.md",
    "06_ПАЙДАЛАНЫЛҒАН_ӘДЕБИЕТТЕР.md",
    "07_ҚОСЫМША_А_ТТ.md",
    "08_ҚОСЫМША_Б_КОД.md"
)

Write-Host "Конвертация файлов..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    if (Test-Path $file) {
        $outputFile = Join-Path $outputDir ($file -replace '\.md$', '.docx')
        
        Write-Host "📄 $file → $outputFile" -ForegroundColor White
        
        # Конвертация с настройками для сохранения форматирования
        pandoc $file `
            -o $outputFile `
            --from markdown `
            --to docx `
            --highlight-style tango `
            --reference-doc=reference.docx `
            --toc `
            --toc-depth=3 `
            --number-sections `
            2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Успешно" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Ошибка (но файл может быть создан)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Файл не найден: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Конвертация завершена!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Все файлы в папке: $outputDir" -ForegroundColor White
Write-Host ""
Write-Host "💡 Совет: Откройте файлы в Word и настройте стили:" -ForegroundColor Yellow
Write-Host "   - Заголовки: 14-18pt, жирный" -ForegroundColor White
Write-Host "   - Код: Courier New, 10pt, серый фон" -ForegroundColor White
Write-Host "   - Таблицы: границы, заливка заголовков" -ForegroundColor White
Write-Host ""

# Создаем объединенный документ
Write-Host "Создание объединенного документа..." -ForegroundColor Cyan

$allFilesExist = $true
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        $allFilesExist = $false
        break
    }
}

if ($allFilesExist) {
    $combinedOutput = Join-Path $outputDir "ДИПЛОМ_ПОЛНЫЙ.docx"
    
    pandoc @files `
        -o $combinedOutput `
        --from markdown `
        --to docx `
        --highlight-style tango `
        --toc `
        --toc-depth=3 `
        --number-sections `
        2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Полный диплом создан: $combinedOutput" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Готово! 🎉" -ForegroundColor Green
