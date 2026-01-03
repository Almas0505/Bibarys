"""
Code Quality Validator - проверяет качество кода
"""
import os
import ast
import sys
from pathlib import Path

class CodeValidator:
    def __init__(self, directory):
        self.directory = directory
        self.issues = []
        
    def validate_file(self, filepath):
        """Проверяет один файл"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Парсим AST
            tree = ast.parse(content, filename=filepath)
            
            # Проверяем сложность функций
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    complexity = self._calculate_complexity(node)
                    if complexity > 10:
                        self.issues.append({
                            'file': filepath,
                            'type': 'HIGH_COMPLEXITY',
                            'line': node.lineno,
                            'message': f"Функция '{node.name}' имеет сложность {complexity} (рекомендуется < 10)"
                        })
                        
                # Проверяем длинные функции
                if isinstance(node, ast.FunctionDef):
                    func_lines = node.end_lineno - node.lineno
                    if func_lines > 50:
                        self.issues.append({
                            'file': filepath,
                            'type': 'LONG_FUNCTION',
                            'line': node.lineno,
                            'message': f"Функция '{node.name}' содержит {func_lines} строк (рекомендуется < 50)"
                        })
                        
            return True
            
        except SyntaxError as e:
            self.issues.append({
                'file': filepath,
                'type': 'SYNTAX_ERROR',
                'line': e.lineno,
                'message': str(e)
            })
            return False
        except Exception as e:
            self.issues.append({
                'file': filepath,
                'type': 'ERROR',
                'line': 0,
                'message': f"Ошибка при проверке: {str(e)}"
            })
            return False
            
    def _calculate_complexity(self, node):
        """Вычисляет цикломатическую сложность"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity
        
    def validate_directory(self):
        """Проверяет все Python файлы в директории"""
        print(f"Проверка качества кода в: {self.directory}")
        print("=" * 70)
        
        python_files = list(Path(self.directory).rglob("*.py"))
        
        # Исключаем __pycache__, tests, venv
        python_files = [
            f for f in python_files 
            if '__pycache__' not in str(f) 
            and 'venv' not in str(f)
            and '.venv' not in str(f)
        ]
        
        print(f"Найдено {len(python_files)} Python файлов\n")
        
        valid_files = 0
        for filepath in python_files:
            if self.validate_file(filepath):
                valid_files += 1
                
        print(f"\n{'=' * 70}")
        print(f"Проверено: {len(python_files)} файлов")
        print(f"Валидных: {valid_files}")
        print(f"С проблемами: {len(python_files) - valid_files}")
        print(f"Всего предупреждений: {len(self.issues)}")
        
        if self.issues:
            print(f"\n{'=' * 70}")
            print("НАЙДЕННЫЕ ПРОБЛЕМЫ:")
            print("=" * 70)
            
            # Группируем по типу
            by_type = {}
            for issue in self.issues:
                issue_type = issue['type']
                if issue_type not in by_type:
                    by_type[issue_type] = []
                by_type[issue_type].append(issue)
                
            for issue_type, issues in by_type.items():
                print(f"\n{issue_type}: {len(issues)} случаев")
                for issue in issues[:5]:  # Показываем первые 5
                    file_short = os.path.relpath(issue['file'], self.directory)
                    print(f"  - {file_short}:{issue['line']} - {issue['message']}")
                if len(issues) > 5:
                    print(f"  ... и еще {len(issues) - 5}")
        else:
            print("\n✅ Проблем не найдено!")
            
        return len(self.issues) == 0

if __name__ == "__main__":
    validator = CodeValidator("c:\\Projects\\Bibarys\\backend\\app")
    success = validator.validate_directory()
    sys.exit(0 if success else 1)
