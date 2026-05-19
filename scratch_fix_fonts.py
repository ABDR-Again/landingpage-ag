import re

path = r'c:\landinggpage AG\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the font link
old_link = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">'
new_link = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">'
content = content.replace(old_link, new_link)

# Replace inline font-family styles
content = content.replace("font-family:'Cormorant Garamond',Georgia,serif;", '')
content = content.replace(" style=\"font-family:'Cormorant Garamond',Georgia,serif\"", '')

# Clean up empty style attributes created by the first replacement just in case
content = content.replace(' style=""', '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced fonts successfully')
