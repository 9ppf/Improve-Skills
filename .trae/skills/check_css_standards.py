"""
CSS 规范检查脚本（css-gate Skill + build.py 配套）

检查项：
1. 共享 CSS 引用检测——每个 Workbench 页面必须引用 base-vars/base/components + theme-sync.js
2. 内联 <style> 块检测——禁止在页面中写 <style>，必须抽离到外部 CSS
3. 全局样式改动检测（CSS变量、全局标签、全局组件）—— 改动时需先问用户
4. !important 使用检测
5. 裸类名检测（.card/.btn/.item 等通类，无模块前缀）
6. 行内样式检测（style 属性中包含静态样式值）
7. 硬编码色值检测（应该用 CSS 变量的地方用了具体色值）

注意：
- 扫描 Workbench/ 下的 HTML 页面（含 <style> 块和 style 属性）
- 不扫描 SCSS 源文件（SCSS 是设计系统，允许全局定义）
- 共享引用检测和内联样式检测为 hard error（阻断构建）
- 其他检查项为 advisory warning
"""
import os
import re
import sys
import subprocess
import fnmatch

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORKBENCH_DIR = os.path.join(ROOT, "Workbench")

# 裸类名黑名单（不带模块前缀的通用类名）
GENERIC_CLASS_BLACKLIST = {
    'card', 'btn', 'button', 'item', 'list', 'title', 'header', 'footer',
    'container', 'wrapper', 'box', 'panel', 'section', 'row', 'col',
    'active', 'selected', 'disabled', 'hidden', 'show', 'hide',
    'primary', 'secondary', 'success', 'warning', 'danger', 'info',
    'text', 'content', 'body', 'main', 'side', 'nav', 'menu',
    'top', 'bottom', 'left', 'right', 'center',
}

# 全局标签选择器（直接用标签名的）
TAG_SELECTORS = {'div', 'p', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'input', 'button', 'form', 'table', 'tr', 'td', 'th'}


def get_git_changed_html_files():
    """获取 git 中变更的 HTML 文件列表（关闭 quotepath 避免中文文件名被转义）"""
    try:
        result = subprocess.run(
            ['git', '-c', 'core.quotepath=false', 'diff', '--name-only', 'HEAD'],
            cwd=ROOT, capture_output=True, text=True, encoding='utf-8'
        )
        files = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]
        return [f for f in files if f.endswith('.html') and 'Workbench' in f]
    except Exception:
        return []


def extract_style_blocks(html_content):
    """提取 HTML 中的 <style> 块内容"""
    blocks = re.findall(r'<style[^>]*>(.*?)</style>', html_content, re.DOTALL | re.IGNORECASE)
    return blocks


def extract_inline_styles(html_content):
    """提取 HTML 中的行内 style 属性"""
    styles = re.findall(r'style="([^"]+)"', html_content)
    return styles


def check_important(style_blocks, filepath):
    """检查 !important 使用"""
    issues = []
    for i, block in enumerate(style_blocks):
        if '!important' in block:
            count = block.count('!important')
            issues.append(f'{filepath} style#{i+1} 中使用了 {count} 次 !important')
    return issues


def check_generic_classes(style_blocks, filepath):
    """检查裸类名（无模块前缀的通用类名）"""
    issues = []
    for i, block in enumerate(style_blocks):
        # 提取所有类选择器
        classes = re.findall(r'\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{', block)
        for cls in classes:
            # 排除 SCSS 变量和特殊情况
            cls_lower = cls.lower().rstrip(':')
            if cls_lower in GENERIC_CLASS_BLACKLIST:
                issues.append(f'{filepath} style#{i+1} 使用了裸类名 .{cls}（应加模块前缀）')
    return issues


def check_tag_selectors(style_blocks, filepath):
    """检查全局标签选择器"""
    issues = []
    for i, block in enumerate(style_blocks):
        # 匹配以标签开头的选择器（如 p {、li {、div {）
        tag_matches = re.findall(r'(?:^|}|\n)\s*([a-z][a-z0-9]*)\s*\{', block, re.IGNORECASE)
        for tag in tag_matches:
            if tag.lower() in TAG_SELECTORS:
                issues.append(f'{filepath} style#{i+1} 使用了全局标签选择器 {tag} {{}}（应带类名限定）')
    return issues


def check_hardcoded_colors(style_blocks, filepath):
    """检查硬编码色值（应该用 CSS 变量的地方）"""
    issues = []
    # 色值模式：#xxx #xxxxxx rgb() rgba() hsl()
    color_pattern = r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)'
    for i, block in enumerate(style_blocks):
        colors = re.findall(color_pattern, block)
        # 排除一些特殊情况（如边框透明色、currentColor 等）
        # 统计数量，超过阈值提示
        if len(colors) > 3:
            issues.append(f'{filepath} style#{i+1} 中有 {len(colors)} 处硬编码色值（建议使用 CSS 变量）')
    return issues


def check_global_css_vars(style_blocks, filepath):
    """检查是否修改了全局 CSS 变量（--accent, --bg 等）"""
    issues = []
    global_vars = ['--accent', '--accent2', '--bg', '--bg2', '--text', '--muted', '--border', '--green', '--amber']
    for i, block in enumerate(style_blocks):
        for var in global_vars:
            if f'{var}:' in block:
                issues.append(f'{filepath} style#{i+1} 中修改了全局变量 {var}（影响全局，请确认用户已知晓）')
    return issues


def check_inline_static_styles(inline_styles, filepath):
    """检查行内样式中是否有静态值（应该写在 CSS 里的）"""
    issues = []
    static_props = ['color:', 'background:', 'background-color:', 'font-size:', 'padding:', 'margin:', 'border:', 'border-radius:', 'width:', 'height:']
    for style in inline_styles:
        for prop in static_props:
            if prop in style and 'var(' not in style and 'calc(' not in style:
                issues.append(f'{filepath} 行内样式包含静态属性 {prop.rstrip(":")}（建议写在 CSS 类中）')
                break  # 每个 style 属性只报一次
    return issues


def check_file(filepath):
    """检查单个 HTML 文件"""
    full_path = os.path.join(ROOT, filepath)
    if not os.path.exists(full_path):
        return []

    issues = []
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return [f'{filepath} 读取失败']

    style_blocks = extract_style_blocks(content)
    inline_styles = extract_inline_styles(content)

    if style_blocks:
        issues.extend(check_important(style_blocks, filepath))
        issues.extend(check_generic_classes(style_blocks, filepath))
        issues.extend(check_tag_selectors(style_blocks, filepath))
        issues.extend(check_global_css_vars(style_blocks, filepath))
        issues.extend(check_hardcoded_colors(style_blocks, filepath))

    if inline_styles:
        issues.extend(check_inline_static_styles(inline_styles, filepath))

    return issues


def check_css_standards():
    """检查变更 HTML 文件的 CSS 规范（增量模式）"""
    changed_files = get_git_changed_html_files()
    all_issues = []

    if not changed_files:
        return all_issues

    for f in changed_files:
        issues = check_file(f)
        all_issues.extend(issues)

    return all_issues


# 全量基线扫描的核心页面（只扫关键页面，避免全量扫描太多历史问题）
# 知识框架页面已统一为自考学习/知识框架.html 单页（方案A-1，?subject= 参数区分三科）
BASELINE_FILES = [
    'Workbench/自考学习/知识框架.html',
    'Workbench/自考学习/背诵与简答-核心概念背诵卡.html',
    'Workbench/自考学习/练习测验.html',
    'Workbench/自考学习/复盘总结-章节复盘.html',
    'Workbench/今日学习/today-flow.html',
    'Workbench/能力提升/能力提升-学习驾驶舱.html',
    'Workbench/Python基础/python-knowledge-tree.html',
    'Workbench/ai-learning/ai-knowledge-tree.html',
    'Workbench/ai-learning/job-skill-tree.html',
]


def check_css_baseline():
    """全量基线扫描：检查核心页面的 CSS 规范"""
    all_issues = []
    for f in BASELINE_FILES:
        issues = check_file(f)
        all_issues.extend(issues)
    return all_issues


# ---------------------------------------------------------------------------
# 共享 CSS 引用检测（hard error，阻断构建）
# ---------------------------------------------------------------------------
WHITELIST_PATTERNS = [
    '*此刻便是春天.html',
    '*_备份_*.html',
    '*设计稿*.html',
    '*设计方案*.html',
]

SHARED_REQUIRED = [
    'base-vars.css',
    'base.css',
    'components.css',
    'theme-sync.js',
]


def is_whitelisted(filepath):
    """检查文件是否匹配白名单模式"""
    # 检查文件名
    basename = os.path.basename(filepath)
    for pattern in WHITELIST_PATTERNS:
        if fnmatch.fnmatch(basename, pattern):
            return True
    # 检查路径中是否包含备份目录
    normalized = filepath.replace('\\', '/')
    if '_备份_' in normalized:
        return True
    return False


def find_all_workbench_html():
    """遍历 Workbench/ 下所有 HTML 文件"""
    html_files = []
    for root_dir, dirs, files in os.walk(WORKBENCH_DIR):
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root_dir, f))
    return sorted(html_files)


def check_shared_css_references():
    """全量扫描：检查每个 Workbench 页面是否引用了共享 CSS 和 theme-sync.js

    返回 (errors, warnings)：
    - errors: 共享引用缺失 + 内联 <style> 块（hard error，阻断构建）
    - warnings: 其他 CSS 规范问题（advisory，不阻断）
    """
    errors = []
    warnings = []
    html_files = find_all_workbench_html()

    for filepath in html_files:
        rel_path = os.path.relpath(filepath, ROOT).replace('\\', '/')

        if is_whitelisted(filepath):
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            continue

        # 检查 1：必须引用 4 个共享文件
        for required in SHARED_REQUIRED:
            if required not in content:
                errors.append(f'{rel_path}: 缺少共享文件引用 {required}')

        # 检查 2：禁止内联 <style> 块
        style_blocks = re.findall(r'<style[^>]*>', content, re.IGNORECASE)
        if style_blocks:
            errors.append(f'{rel_path}: 存在 {len(style_blocks)} 个内联 <style> 块，应抽离到外部CSS')

        # 检查 3-7：复用 check_file 的检查逻辑（advisory）
        advisory = check_file(rel_path)
        if advisory:
            warnings.extend(advisory)

    return errors, warnings


if __name__ == "__main__":
    # --full 模式：全量扫描所有 Workbench 页面的共享引用（hard error）
    if '--full' in sys.argv:
        errors, warnings = check_shared_css_references()
        if errors:
            print(f"[ERROR] 共享CSS引用检查发现 {len(errors)} 个硬性错误：")
            for e in errors:
                print(f"  - {e}")
        if warnings:
            print(f"[WARN] CSS规范检查发现 {len(warnings)} 个建议性问题：")
            for w in warnings[:10]:
                print(f"  - {w}")
            if len(warnings) > 10:
                print(f"  ... 还有 {len(warnings)-10} 个")
        if errors:
            sys.exit(1)
        else:
            print("[OK] 共享CSS引用检查通过")
            if not warnings:
                print("[OK] CSS规范检查通过")
            sys.exit(0)
    # --baseline 模式：全量扫描核心页面
    elif '--baseline' in sys.argv:
        issues = check_css_baseline()
        label = 'CSS 基线'
    else:
        issues = check_css_standards()
        label = 'CSS 增量'
        if issues:
            print(f"[WARN] {label}规范检查发现 {len(issues)} 个问题：")
            for i in issues[:10]:
                print(f"  - {i}")
            if len(issues) > 10:
                print(f"  ... 还有 {len(issues)-10} 个")
            sys.exit(1)
        else:
            print(f"[OK] {label}规范检查通过")
            sys.exit(0)
