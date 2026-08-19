from pathlib import Path
import re

root = Path(__file__).parent
patterns = [
    (r'bg-slate-950', 'bg-[var(--surface)]'),
    (r'bg-slate-900/80', 'bg-[var(--surface-muted)]/80'),
    (r'bg-slate-900/70', 'bg-[var(--surface-muted)]/70'),
    (r'bg-slate-900/60', 'bg-[var(--surface-muted)]/60'),
    (r'bg-slate-900/40', 'bg-[var(--surface-muted)]/40'),
    (r'bg-slate-900/20', 'bg-[var(--surface-muted)]/20'),
    (r'bg-slate-900', 'bg-[var(--surface-muted)]'),
    (r'bg-slate-800/90', 'bg-[var(--surface)]/90'),
    (r'bg-slate-800/80', 'bg-[var(--surface)]/80'),
    (r'bg-slate-800/70', 'bg-[var(--surface)]/70'),
    (r'bg-slate-800/60', 'bg-[var(--surface)]/60'),
    (r'bg-slate-800/50', 'bg-[var(--surface)]/50'),
    (r'bg-slate-800/40', 'bg-[var(--surface)]/40'),
    (r'bg-slate-800', 'bg-[var(--surface)]'),
    (r'bg-slate-700/40', 'bg-[var(--surface-light)]/40'),
    (r'bg-slate-700/20', 'bg-[var(--surface-light)]/20'),
    (r'bg-slate-700', 'bg-[var(--surface-muted)]'),
    (r'bg-slate-600', 'bg-[var(--surface-light)]'),
    (r'border-slate-800/70', 'border-[var(--border-strong)]/70'),
    (r'border-slate-800', 'border-[var(--border-strong)]'),
    (r'border-slate-700', 'border-[var(--border)]'),
    (r'border-slate-600', 'border-[var(--border-strong)]'),
    (r'text-slate-500', 'text-[var(--text-secondary)]'),
    (r'text-slate-400', 'text-[var(--text-secondary)]'),
    (r'text-slate-300', 'text-[var(--text-secondary)]'),
    (r'text-slate-200', 'text-[var(--text-secondary)]'),
    (r'text-slate-100', 'text-[var(--text)]'),
    (r'text-slate-950', 'text-[var(--surface)]'),
    (r'hover:bg-slate-900/80', 'hover:bg-[var(--surface-muted)]/80'),
    (r'hover:bg-slate-900/70', 'hover:bg-[var(--surface-muted)]/70'),
    (r'hover:bg-slate-900/60', 'hover:bg-[var(--surface-muted)]/60'),
    (r'hover:bg-slate-900', 'hover:bg-[var(--surface-muted)]'),
    (r'hover:bg-slate-800/90', 'hover:bg-[var(--surface-light)]/90'),
    (r'hover:bg-slate-800/70', 'hover:bg-[var(--surface-light)]/70'),
    (r'hover:bg-slate-800/60', 'hover:bg-[var(--surface-light)]/60'),
    (r'hover:bg-slate-800/40', 'hover:bg-[var(--surface-light)]/40'),
    (r'hover:bg-slate-800', 'hover:bg-[var(--surface-light)]'),
    (r'hover:bg-slate-700/40', 'hover:bg-[var(--surface-light)]/40'),
    (r'hover:bg-slate-700', 'hover:bg-[var(--surface-light)]'),
    (r'hover:border-slate-700', 'hover:border-[var(--border-strong)]'),
    (r'placeholder:text-slate-400', 'placeholder:text-[var(--text-secondary)]'),
]

modified = []
for path in sorted(root.rglob('*')):
    if path.suffix in {'.js', '.jsx', '.ts', '.tsx'}:
        text = path.read_text(encoding='utf-8')
        new = text
        for old, newval in patterns:
            new = new.replace(old, newval)
        if new != text:
            path.write_text(new, encoding='utf-8')
            modified.append(str(path.relative_to(root)))

print(f"Modified {len(modified)} files")
for f in modified:
    print(f)
