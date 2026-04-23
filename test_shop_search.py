from playwright.sync_api import sync_playwright
import os

html_file_path = os.path.abspath('C:\\personal-website\\index.html')
file_url = f'file:///{html_file_path.replace(os.sep, "/")}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    
    page.goto(file_url)
    page.wait_for_timeout(2000)
    
    page.screenshot(path='C:\\personal-website\\test_screenshot.png', full_page=True)
    print("首页截图已保存")
    
    browser.close()

print("测试完成！")