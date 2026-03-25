import os
import glob

src_dir = r"c:\Users\thiag\.gemini\antigravity\scratch\ecommerce-reverso\frontend\src"

for filepath in glob.glob(src_dir + "/**/*.ts*", recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = False
    
    if "http://localhost:8000" in content or "ws://localhost:8000" in content:
        # Pass 1: Replace with placeholders to avoid multi-matching
        content = content.replace("`http://localhost:8000", "`#TICK_API#")
        content = content.replace("\"http://localhost:8000", "#DOUBLE_API#\"")
        content = content.replace("'http://localhost:8000", "#SINGLE_API#'")
        
        content = content.replace("`ws://localhost:8000", "`#TICK_WS#")
        content = content.replace("\"ws://localhost:8000", "#DOUBLE_WS#\"")
        content = content.replace("'ws://localhost:8000", "#SINGLE_WS#'")
        
        # Pass 2: Replace placeholders with final code
        content = content.replace("#TICK_API#", "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}")
        content = content.replace("#DOUBLE_API#", "(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + ")
        content = content.replace("#SINGLE_API#", "(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + ")

        content = content.replace("#TICK_WS#", "${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}")
        content = content.replace("#DOUBLE_WS#", "(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + ")
        content = content.replace("#SINGLE_WS#", "(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + ")
        modified = True
        
    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
