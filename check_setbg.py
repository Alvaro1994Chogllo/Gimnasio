import re

html = open('c:/xampp/htdocs/gimnasio/plantilla/index.html', encoding='utf-8').read()
matches = re.findall(r'data-setbg="([^"]+)"', html)
print('data-setbg values:', matches)

jsx = open('c:/xampp/htdocs/gimnasio/frontend/src/pages/Home.jsx', encoding='utf-8').read()
print('set-bg in jsx:', 'set-bg' in jsx)
print('backgroundImage in jsx:', 'backgroundImage' in jsx)
print('data-setbg in jsx:', 'data-setbg' in jsx)
# Print lines around hero section
for i, line in enumerate(jsx.splitlines()):
    if 'hero' in line.lower() or 'setbg' in line.lower() or 'background' in line.lower():
        print(i, line)
