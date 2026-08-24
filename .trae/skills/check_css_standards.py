"""
CSS 规范检查脚本（设计稿还原 Skill 配套）

检查项：
1. 全局样式改动检测（CSS变量、全局标签、公共组件）—— 改动时需先问用户
2. !important 使用检测
3. 裸类名检测（.card/.btn/.item 等通类，无模块前缀）
4. 行内样式检测（style 属性中包含静态样式值）
5. 硬编码色值检测（应该用 CSS 变量的地方用了具体色值）

注意：
- 扫描 Workbench/ 下的 HTML 页面（含 <style> 块和 style 属性）
- 不扫描 SCSS 源文件（SCSS 是设计系统，允许全局定义）
- 结果为 advisory warning，不阻止提交
"""
import os
import re
import sys
import subprocess

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
# 知识框架页面已统一为 02324 单页（方案A-1，?subject= 参数区分三科）
BASELINE_FILES = [
    'Workbench/自考学习/备考科目/02324离散数学/02324离散数学-目录与知识框架.html',
    'Workbench/自考学习/背诵与简答/背诵与简答-核心概念背诵卡.html',
    'Workbench/自考学习/背诵与简答/练习测验.html',
    'Workbench/自考学习/复盘总结/复盘总结-章节复盘.html',
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


if __name__ == "__main__":
    # --baseline 模式：全量扫描核心页面
    if '--baseline' in sys.argv:
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
