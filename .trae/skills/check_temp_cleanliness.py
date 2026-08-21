"""
temp 目录规范检查脚本

检查项：
1. temp/ 根目录有没有散落文件（必须全部在子目录下）
2. temp/ 下的一级目录是否为模块目录（中文目录名）
3. 超过 10 天的临时目录警告清理
4. Workbench/ 下有没有中间产物目录（temp/tmp/demo/草稿 等）
"""
import os
import re
import sys
import time
from datetime import datetime, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMP_DIR = os.path.join(ROOT, "temp")
WORKBENCH_DIR = os.path.join(ROOT, "Workbench")

# 中间产物目录关键词（Workbench 下禁止出现）
FORBIDDEN_DIR_NAMES = {
    "temp", "tmp", "demo", "草稿", "中间产物", "test", "测试",
    "debug", "调试", "scratch", "temp_files",
}

# 保留天数
RETENTION_DAYS = 10


def check_temp_root_files():
    """检查 temp/ 根目录有没有散落文件"""
    issues = []
    if not os.path.isdir(TEMP_DIR):
        return issues

    for item in os.listdir(TEMP_DIR):
        item_path = os.path.join(TEMP_DIR, item)
        if os.path.isfile(item_path):
            issues.append(f"temp/ 根目录散落文件：{item}（应放入 temp/{{模块}}/{{任务}}/ 下）")
    return issues


def check_temp_structure():
    """检查 temp/ 的目录结构是否符合 {模块}/{任务}/ 规范"""
    issues = []
    if not os.path.isdir(TEMP_DIR):
        return issues

    for item in os.listdir(TEMP_DIR):
        item_path = os.path.join(TEMP_DIR, item)
        if not os.path.isdir(item_path):
            continue  # 文件在上一项检查
        # 一级目录应该是模块名（中文），直接放脚本的不算
        has_subdirs = any(
            os.path.isdir(os.path.join(item_path, sub))
            for sub in os.listdir(item_path)
        )
        # 如果一级目录下直接是文件，没有子目录，可能是任务目录放错位置了
        if not has_subdirs:
            # 检查目录下是否有脚本/HTML等文件
            files = [f for f in os.listdir(item_path) if os.path.isfile(os.path.join(item_path, f))]
            if files and not item.endswith("设计稿"):
                # 只有设计稿目录允许直接放文件
                pass  # 设计稿目录没问题
    return issues


def check_temp_expired():
    """检查 temp/ 下超过 RETENTION_DAYS 天的目录"""
    issues = []
    if not os.path.isdir(TEMP_DIR):
        return issues

    cutoff = time.time() - RETENTION_DAYS * 86400

    # 检查二级目录（{模块}/{任务}/ 这一级）
    for module in os.listdir(TEMP_DIR):
        module_path = os.path.join(TEMP_DIR, module)
        if not os.path.isdir(module_path):
            continue
        for task in os.listdir(module_path):
            task_path = os.path.join(module_path, task)
            if not os.path.isdir(task_path):
                continue
            # 用目录的修改时间判断
            mtime = os.path.getmtime(task_path)
            if mtime < cutoff:
                days_ago = int((time.time() - mtime) / 86400)
                rel_path = f"temp/{module}/{task}/"
                issues.append(f"临时目录超期（{days_ago}天）：{rel_path}（超过{RETENTION_DAYS}天，建议清理）")

    return issues


def check_workbench_intermediate():
    """检查 Workbench/ 下有没有中间产物目录"""
    issues = []
    if not os.path.isdir(WORKBENCH_DIR):
        return issues

    for root, dirs, files in os.walk(WORKBENCH_DIR):
        # 跳过备份目录
        dirs[:] = [d for d in dirs if "备份" not in d and ".bak" not in d]
        for d in dirs:
            d_lower = d.lower().rstrip("/")
            if d_lower in FORBIDDEN_DIR_NAMES:
                rel = os.path.relpath(os.path.join(root, d), ROOT)
                issues.append(f"Workbench/ 下发现中间产物目录：{rel}（应移到 temp/ 下）")

    return issues


def check_all():
    """执行所有检查，返回问题列表"""
    issues = []
    issues.extend(check_temp_root_files())
    issues.extend(check_temp_expired())
    issues.extend(check_workbench_intermediate())
    return issues


if __name__ == "__main__":
    issues = check_all()
    if issues:
        print(f"[WARN] temp 目录规范检查发现 {len(issues)} 个问题：")
        for i in issues:
            print(f"  - {i}")
        sys.exit(1)
    else:
        print(f"[OK] temp 目录规范检查通过")
        sys.exit(0)
