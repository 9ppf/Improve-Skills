"""
文件说明完整性校验脚本（方案 B 级别）

检查范围（模块级）：
- 根目录：.py / .md 文件
- .trae/skills/：所有 SKILL.md 和 .py 脚本
- templates/：所有 .html
- styles/：所有 .scss
- data/：所有 .json（包括 modules/ 下的）
- Workbench/：模块级目录和主要 .html 页面（一级子目录 + 自考学习二级分类目录）

不检查（内容文件/资源文件）：
- read/ 下的年份 HTML（内容文件，按模块整体记录）
- ai-learning/AI_News_Digest/ 下的内容
- 具体章节 HTML、PDF、图片等
- 备份目录（_备份_、.bak-）
- __pycache__、temp/、node_modules 等
- _shared/ 资源目录
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOC_PATH = os.path.join(ROOT, "docs", "文件说明.md")

SKIP_DIRS = {
    "__pycache__", "node_modules", ".git", "temp", "tmp",
    "_shared", "备份", "AI_News_Digest",
}

SKIP_FILE_PATTERNS = [r"\.bak", r"_备份_", r"~$", r"\.swp$"]

# 内容目录：目录下的文件都是内容文件，不单独检查
CONTENT_DIRS = [
    "Workbench/read/",          # 年份HTML是内容
    "Workbench/自考学习/备考科目/",  # 科目下的章节HTML/PDF是内容
    "Workbench/自考学习/未考科目/",  # 同上
    "Workbench/ai-learning/AI_News_Digest/",
]


def should_skip_file(fname):
    return any(re.search(p, fname) for p in SKIP_FILE_PATTERNS)

def should_skip_dir(dname):
    return dname in SKIP_DIRS or "备份" in dname

def is_content_dir(rel_path):
    """判断路径是否属于内容目录（内容文件不单独检查）"""
    rel_path = rel_path.replace("\\", "/")
    for cd in CONTENT_DIRS:
        if rel_path.startswith(cd):
            return True
    return False


def scan_required_files():
    """扫描方案B级别需要记录的文件/目录"""
    required = []

    # 1. 根目录 .py 和 .md
    for f in os.listdir(ROOT):
        fp = os.path.join(ROOT, f)
        if os.path.isfile(fp) and (f.endswith(".py") or f.endswith(".md")):
            required.append(f)

    # 2. .trae/skills/ 下的 SKILL.md 和 .py
    skills_dir = os.path.join(ROOT, ".trae", "skills")
    if os.path.isdir(skills_dir):
        for root, dirs, files in os.walk(skills_dir):
            dirs[:] = [d for d in dirs if not should_skip_dir(d)]
            for f in files:
                if f.endswith("SKILL.md") or f.endswith(".py"):
                    rel = os.path.relpath(os.path.join(root, f), ROOT)
                    required.append(rel.replace("\\", "/"))

    # 3. templates/ 全部
    tpl_dir = os.path.join(ROOT, "templates")
    if os.path.isdir(tpl_dir):
        for f in os.listdir(tpl_dir):
            if os.path.isfile(os.path.join(tpl_dir, f)):
                required.append(f"templates/{f}")

    # 4. styles/ 全部
    styles_dir = os.path.join(ROOT, "styles")
    if os.path.isdir(styles_dir):
        for f in os.listdir(styles_dir):
            if f.endswith(".scss") or f.endswith(".css"):
                required.append(f"styles/{f}")

    # 5. data/ 全部 .json
    data_dir = os.path.join(ROOT, "data")
    if os.path.isdir(data_dir):
        for root, dirs, files in os.walk(data_dir):
            dirs[:] = [d for d in dirs if not should_skip_dir(d)]
            for f in files:
                if f.endswith(".json"):
                    rel = os.path.relpath(os.path.join(root, f), ROOT)
                    required.append(rel.replace("\\", "/"))

    # 6. Workbench/ — 模块级
    wb_dir = os.path.join(ROOT, "Workbench")
    if os.path.isdir(wb_dir):
        # 根级 .html
        for f in os.listdir(wb_dir):
            if os.path.isfile(os.path.join(wb_dir, f)) and f.endswith(".html"):
                if not should_skip_file(f):
                    required.append(f"Workbench/{f}")
        # 一级子目录
        for d in os.listdir(wb_dir):
            dp = os.path.join(wb_dir, d)
            if not os.path.isdir(dp) or should_skip_dir(d):
                continue
            rel_d = f"Workbench/{d}/"
            if is_content_dir(rel_d):
                # 内容目录只记目录名，不记里面的文件
                required.append(rel_d)
                continue
            required.append(rel_d)
            # 目录下的 .html 文件
            for f in os.listdir(dp):
                fp = os.path.join(dp, f)
                if os.path.isfile(fp) and f.endswith(".html") and not should_skip_file(f):
                    required.append(f"Workbench/{d}/{f}")
                # 自考学习下的二级分类目录也记录
                if os.path.isdir(fp) and d == "自考学习" and not should_skip_dir(f):
                    sub_rel = f"Workbench/{d}/{f}/"
                    if is_content_dir(sub_rel):
                        required.append(sub_rel)
                        continue
                    required.append(sub_rel)
                    # 二级目录下的三级科目目录也记录（内容目录，只记目录）
                    for sub in os.listdir(fp):
                        sp = os.path.join(fp, sub)
                        if os.path.isdir(sp) and not should_skip_dir(sub):
                            required.append(f"Workbench/{d}/{f}/{sub}/")
            # ai-learning 下的 JSON 数据文件也记录
            if d == "ai-learning":
                for f in os.listdir(dp):
                    if f.endswith(".json"):
                        required.append(f"Workbench/{d}/{f}")

    return sorted(set(required))


def check_in_doc(path, doc_content):
    """检查某个路径是否在文件说明文档中有记录"""
    if path.endswith("/"):
        # 目录：匹配多种可能的格式
        dir_name = path.rstrip("/").split("/")[-1]
        patterns = [
            f"`{dir_name}/",     # 反引号开头：`xxx/
            f"{dir_name}/ —",    # 列表项：xxx/ — 描述
            f" {dir_name}/",     # 标题中：### xxx/
            f"## {dir_name}/",   # 二级标题
            f"### {dir_name}/",  # 三级标题
            f"#### {dir_name}/", # 四级标题
        ]
        for p in patterns:
            if p in doc_content:
                return True
        return False
    else:
        # 文件
        fname = os.path.basename(path)

        # .trae/skills/ 下的文件，文档中可能写为 skills/xxx
        if path.startswith(".trae/skills/"):
            short_path = path.replace(".trae/skills/", "skills/")
            if f"`{short_path}`" in doc_content:
                return True

        # data/ 下的文件
        if path.startswith("data/"):
            if f"`{fname}`" in doc_content:
                return True

        # styles/ 下的文件
        if path.startswith("styles/"):
            if f"`{fname}`" in doc_content:
                return True

        # templates/ 下的文件
        if path.startswith("templates/"):
            if f"`{fname}`" in doc_content:
                return True

        # Workbench/ 下的文件
        if path.startswith("Workbench/"):
            if path == "Workbench/此刻便是春天.html":
                # 构建产物，根目录已记
                return True
            if f"`{fname}`" in doc_content:
                return True

        # 根目录文件
        if "/" not in path:
            if f"`{fname}`" in doc_content:
                return True

        # 兜底：完整路径匹配
        if f"`{path}`" in doc_content:
            return True

        return False


def check_file_doc_coverage():
    """检查文件说明.md 是否覆盖了所有方案B级别的文件"""
    if not os.path.exists(DOC_PATH):
        return ["文件说明.md 不存在"], []

    with open(DOC_PATH, "r", encoding="utf-8") as f:
        doc_content = f.read()

    required = scan_required_files()
    missing = []
    found = []

    for path in required:
        if check_in_doc(path, doc_content):
            found.append(path)
        else:
            missing.append(path)

    return missing, found


if __name__ == "__main__":
    missing, found = check_file_doc_coverage()
    if missing:
        print(f"[WARN] 文件说明.md 缺少 {len(missing)} 个文件/目录的记录：")
        for m in missing:
            print(f"  - {m}")
        print(f"\n已记录 {len(found)} 个")
        sys.exit(1)
    else:
        print(f"[OK] 文件说明.md 覆盖完整（共 {len(found)} 个）")
        sys.exit(0)
