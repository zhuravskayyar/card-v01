#!/usr/bin/env python3
"""
Elem-Clone Card Game Server
Запуск локального сервера для гри
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Конфігурація
PORT = 8000
GAME_FOLDER = Path(__file__).parent / "elem-clone"
GAME_URL = f"http://localhost:{PORT}"

def main():
    # Перевірити чи папка існує
    if not GAME_FOLDER.exists():
        print(f"❌ Помилка: папка {GAME_FOLDER} не знайдена")
        return False
    
    # Змінити робочу директорію на папку гри
    os.chdir(GAME_FOLDER)
    
    # Запустити сервер
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("\n" + "="*50)
            print("🎮 Elem-Clone Card Game Server")
            print("="*50)
            print(f"✅ Сервер запущено: {GAME_URL}")
            print(f"📁 Папка: {GAME_FOLDER}")
            print(f"🔌 Порт: {PORT}")
            print("\n🕹️  Навіть у браузері:")
            print(f"   {GAME_URL}")
            print("\n📚 Документація:")
            print(f"   {GAME_URL}/UPGRADE_SYSTEM.md")
            print(f"   {GAME_URL}/CARD_DETAILS_PAGE.md")
            print(f"   {GAME_URL}/COMPLETE_GUIDE.md")
            print("\n🧪 Тестування:")
            print(f"   {GAME_URL}/test-upgrade-logic.html")
            print(f"   {GAME_URL}/TEST_CARD_DETAILS.html")
            print("\n⛔ Для завершення натисніть Ctrl+C")
            print("="*50 + "\n")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n" + "="*50)
        print("🛑 Сервер зупинено")
        print("="*50 + "\n")
        return True
    except OSError as e:
        print(f"\n❌ Помилка: {e}")
        if e.errno == 48:  # Address already in use
            print(f"   Порт {PORT} уже використовується")
            print(f"   Спробуйте іншу команду:")
            print(f"   cd {GAME_FOLDER}")
            print(f"   python -m http.server 8001")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
