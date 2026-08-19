from pathlib import Path
root = Path(__file__).parent
replacements = [
    ('px-6 py-3', 'px-4 py-3'),
    ('px-6 py-4', 'px-4 py-3'),
    ('px-6 py-3 ', 'px-4 py-3 '),
    ('px-6 py-4 ', 'px-4 py-3 '),
]
modified = []
for path in root.rglob('*'):
    if path.suffix in {'.js', '.jsx', '.ts', '.tsx'}:
        text = path.read_text(encoding='utf-8')
        new = text
        for old, newval in replacements:
            new = new.replace(old, newval)
        if new != text:
            path.write_text(new, encoding='utf-8')
            modified.append(str(path.relative_to(root)))
print('Modified', len(modified), 'files')
for f in modified:
    print(f)
