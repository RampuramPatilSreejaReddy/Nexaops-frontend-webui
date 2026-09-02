import ftfy

path = "src/pages/JobStatus.jsx"
with open(path, encoding="utf-8") as f:
    text = f.read()

fixed = ftfy.fix_text(text)
print("Changed:", text != fixed)
print(f"Length before: {len(text)}, after: {len(fixed)}")

with open(path, "w", encoding="utf-8", newline="") as f:
    f.write(fixed)

print("Done — encoding corrected.")