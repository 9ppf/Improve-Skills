// ============================================================
// 13003 数据结构与算法 — 真题数据
// 数据来源：2025年4月真题（OCR提取+人工校对）
// ============================================================

window.EXAM_DATA = window.EXAM_DATA || {};
window.EXAM_DATA['13003'] = {
  papers: [
    { id: 'p202504', year: '2025年4月', title: '2025年4月数据结构与算法', duration: 150, count: 34 },
    { id: 'p202410', year: '2024年10月', title: '2024年10月数据结构与算法', duration: 150, count: 34 }
  ],
  questions: [
    // ========== 一、单项选择题 (15题×2分=30分) ==========
    {
      id: 1, year: '2025年4月', type: '选择题',
      chapter: '第一章·绪论',
      title: '下列关于数据的逻辑结构的叙述中，不正确的是',
      options: ['A. 数据的逻辑结构是数据间关系的描述', 'B. 数据的逻辑结构抽象反映数据元素间的逻辑关系', 'C. 数据的逻辑结构具体反映数据在计算机中的存储方式', 'D. 数据的逻辑结构分为线性结构和非线性结构'],
      answer: 'C',
      explanation: '数据的存储结构反映计算机中的存储方式，逻辑结构是抽象的关系描述。',
      status: 'pending'
    },
    {
      id: 2, year: '2025年4月', type: '选择题',
      chapter: '第一章·绪论',
      title: '算法分析要评估的两个主要方面是',
      options: ['A. 空间复杂度和时间复杂度', 'B. 正确性和简明性', 'C. 可读性和文档性', 'D. 数据复杂性和程序复杂性'],
      answer: 'A',
      explanation: '算法分析核心评估时间复杂度和空间复杂度。',
      status: 'pending'
    },
    {
      id: 3, year: '2025年4月', type: '选择题',
      chapter: '第一章·绪论',
      title: '将斐波那契数列前n项保存在数组中，设计算法时适宜使用的策略是',
      options: ['A. 分治法', 'B. 穷举法', 'C. 递归法', 'D. 递推法'],
      answer: 'D',
      explanation: '斐波那契数列满足递推公式，递推法最适宜。',
      status: 'pending'
    },
    {
      id: 4, year: '2025年4月', type: '选择题',
      chapter: '第二章·线性表',
      title: '设顺序表中有n个数据元素，若删除表中第i个元素，则需要移动的元素个数是',
      options: ['A. n', 'B. n-i-1', 'C. 1', 'D. n-i'],
      answer: 'D',
      explanation: '删除第i个元素，后续n-i个元素需向前移动。',
      status: 'pending'
    },
    {
      id: 5, year: '2025年4月', type: '选择题',
      chapter: '第二章·线性表',
      title: '在头指针为head的非空单向循环链表中，指针p指向尾结点，下列关系成立的是',
      options: ['A. p->next==head', 'B. p->next->next==head', 'C. p->next==NULL', 'D. p==head'],
      answer: 'A',
      explanation: '单向循环链表尾结点的next指针指向头结点。',
      status: 'pending'
    },
    {
      id: 6, year: '2025年4月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '一个栈的输入序列为1,2,3,...,n，若输出序列的第一个元素是n，则第i(1<i≤n)个输出元素是',
      options: ['A. n-i-1', 'B. n-i+1', 'C. n-i', 'D. i'],
      answer: 'B',
      explanation: '栈先进后出，首出n则后续依次为n-1、n-2...，第i个为n-i+1。',
      status: 'pending'
    },
    {
      id: 7, year: '2025年4月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '入栈序列是1,2,3,4，出栈序列是2,4,3,1，则栈的容量最小是',
      options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
      answer: 'C',
      explanation: '入栈1、2出2，入栈3、4出4，过程中栈内最多3个元素，容量最小为3。',
      status: 'pending'
    },
    {
      id: 8, year: '2025年4月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '已知循环队列存储在一维数组A[0...n-1]中，且队列非空时front和rear分别指向队头元素与队尾元素。若初始时队列为空，且要求第一个进入队列的元素存储在A[0]处，则初始时front和rear的值分别是',
      options: ['A. 0,0', 'B. 0,n-1', 'C. n-1,0', 'D. n-1,n-1'],
      answer: 'B',
      explanation: '循环队列初始空，front=0, rear=n-1，入队时先移动rear再存元素，保证首个元素存A[0]。',
      status: 'pending'
    },
    {
      id: 9, year: '2025年4月', type: '选择题',
      chapter: '第四章·数组、广义表和串',
      title: '广义表((a),a)的表头和表尾分别是',
      options: ['A. a,((a))', 'B. ((a),a)', 'C. (a),a', 'D. (a),(a)'],
      answer: 'D',
      explanation: '广义表表头是第一个元素(a)，表尾是除去表头后的剩余部分(a)。',
      status: 'pending'
    },
    {
      id: 10, year: '2025年4月', type: '选择题',
      chapter: '第四章·数组、广义表和串',
      title: '设有两个串p和q，其中q是p的子串，求q在p中首次出现的位置的运算称为',
      options: ['A. 模式匹配', 'B. 联接', 'C. 求子串', 'D. 求串长'],
      answer: 'A',
      explanation: '模式匹配是求子串在主串中首次出现的位置。',
      status: 'pending'
    },
    {
      id: 11, year: '2025年4月', type: '选择题',
      chapter: '第五章·树与二叉树',
      title: '若一棵二叉树中度为1的结点个数是3，度为2的结点个数是4，则该二叉树叶子结点的个数是',
      options: ['A. 4', 'B. 5', 'C. 7', 'D. 8'],
      answer: 'B',
      explanation: '二叉树性质：叶子结点数 = 度为2的结点数 + 1，即4+1=5。',
      status: 'pending'
    },
    {
      id: 12, year: '2025年4月', type: '选择题',
      chapter: '第六章·图结构',
      title: '求带权图单源最短路径的算法称为',
      options: ['A. 迪杰斯特拉(Dijkstra)算法', 'B. 克鲁斯卡尔(Kruskal)算法', 'C. 普里姆(Prim)算法', 'D. 广度优先搜索算法'],
      answer: 'A',
      explanation: 'Dijkstra算法求单源最短路径；Kruskal和Prim求最小生成树；BFS求最短路径(无权图)。',
      status: 'pending'
    },
    {
      id: 13, year: '2025年4月', type: '选择题',
      chapter: '第七章·内部排序',
      title: '平均时间复杂度为O(nlogn)的稳定排序算法是',
      options: ['A. 快速排序', 'B. 堆排序', 'C. 归并排序', 'D. 冒泡排序'],
      answer: 'C',
      explanation: '归并排序平均时间复杂度O(nlogn)且稳定；快速、堆排序不稳定；冒泡排序时间复杂度O(n²)。',
      status: 'pending'
    },
    {
      id: 14, year: '2025年4月', type: '选择题',
      chapter: '第八章·查找',
      title: '分块查找方法将表分为多块，并要求',
      options: ['A. 块内有序', 'B. 各块等长', 'C. 块间有序', 'D. 链式存储'],
      answer: 'C',
      explanation: '分块查找要求块间有序、块内无序，块可以不等长，存储方式为顺序存储。',
      status: 'pending'
    },
    {
      id: 15, year: '2025年4月', type: '选择题',
      chapter: '第七章·内部排序',
      title: '下列关键字序列中，构成大根堆的是',
      options: ['A. 5,8,1,3,9,6,2,7', 'B. 9,8,1,7,5,6,2,3', 'C. 9,8,6,3,5,1,2,7', 'D. 9,8,6,7,5,1,2,3'],
      answer: 'D',
      explanation: '大根堆要求每个结点值≥其左右孩子值，逐一验证只有D满足。',
      status: 'pending'
    },

    // ========== 二、填空题 (10题×2分=20分) ==========
    {
      id: 16, year: '2025年4月', type: '填空题',
      chapter: '第一章·绪论',
      title: '在数据结构中，____作为一个完整的对象(整体)是构成数据的基本单位。',
      answer: '数据元素',
      explanation: '数据元素是构成数据的基本单位，作为一个完整的整体。',
      status: 'pending'
    },
    {
      id: 17, year: '2025年4月', type: '填空题',
      chapter: '第一章·绪论',
      title: '算法中要做的运算都是相当基本的、能够精确进行的，这个特性是算法的____。',
      answer: '可行性',
      explanation: '算法的五大特性：有穷性、确定性、可行性、输入、输出。',
      status: 'pending'
    },
    {
      id: 18, year: '2025年4月', type: '填空题',
      chapter: '第二章·线性表',
      title: '线性表基本操作的具体实现需要依赖线性表的____。',
      answer: '存储结构',
      explanation: '线性表的存储结构分顺序和链式，操作实现依赖存储结构。',
      status: 'pending'
    },
    {
      id: 19, year: '2025年4月', type: '填空题',
      chapter: '第六章·图结构',
      title: '在有n个顶点的无向图中，其边数最多可达____。',
      answer: 'n(n-1)/2',
      explanation: '无向图边数最多为完全无向图，任意两顶点间有一条边。',
      status: 'pending'
    },
    {
      id: 20, year: '2025年4月', type: '填空题',
      chapter: '第五章·树与二叉树',
      title: '高度为4的AVL树中，最少有____个结点。',
      answer: '7',
      explanation: 'AVL树是平衡二叉树，高度h的最少结点数满足递推公式：N(h)=N(h-1)+N(h-2)+1，N(1)=1, N(2)=2, N(3)=4, N(4)=7。',
      status: 'pending'
    },
    {
      id: 21, year: '2025年4月', type: '填空题',
      chapter: '第八章·查找',
      title: '在有序表(1,3,9,12,32,41,45,62,75,77,82,95,100)中，进行折半查找时，若查找关键字9时的比较次数为2，则查找关键字75时的比较次数是____。',
      answer: '3',
      explanation: '按折半查找规则计算，75的比较次数为3。',
      status: 'pending'
    },
    {
      id: 22, year: '2025年4月', type: '填空题',
      chapter: '第七章·内部排序',
      title: '影响排序效率的两个因素是关键字的____次数和记录的移动次数。',
      answer: '比较',
      explanation: '排序效率由关键字比较次数和记录移动次数决定。',
      status: 'pending'
    },
    {
      id: 23, year: '2025年4月', type: '填空题',
      chapter: '第四章·数组、广义表和串',
      title: '对特殊矩阵进行压缩的目的是节省____。',
      answer: '存储空间',
      explanation: '特殊矩阵(如对称、三角、对角矩阵)存在大量相同元素或零元素，压缩存储节省空间。',
      status: 'pending'
    },
    {
      id: 24, year: '2025年4月', type: '填空题',
      chapter: '第七章·内部排序',
      title: '对序列{55,46,13,94,17,42}进行基数排序，第一趟排序后的结果是____。',
      answer: '55,13,42,46,17,94',
      explanation: '基数排序第一趟按个位排序，个位依次为5,6,3,4,7,2，排序后为55(5),13(3),42(2),46(6),17(7),94(4)。',
      status: 'pending'
    },
    {
      id: 25, year: '2025年4月', type: '填空题',
      chapter: '第五章·树与二叉树',
      title: '设一棵二叉树的中序遍历序列为ABCD，后序遍历序列为BADC，则其先序遍历序列为____。',
      answer: 'CABD',
      explanation: '由中序(ABCD)和后序(BADC)推根结点为C，左子树为AB，右子树为D；再推左子树根为A，左子树无，右子树为B，最终先序遍历为CABD。',
      status: 'pending'
    },

    // ========== 三、解答题 (4题×5分=20分) ==========
    {
      id: 26, year: '2025年4月', type: '解答题',
      chapter: '第八章·查找',
      title: '列出五种构造哈希函数的方法。',
      answer: '1. 直接定址法：取关键字或关键字的线性函数值作为哈希地址，H(key)=key或H(key)=a×key+b\n2. 数字分析法：分析关键字各位数字分布，选取分布均匀的位作为哈希地址\n3. 平方取中法：将关键字平方，取中间若干位作为哈希地址\n4. 折叠法：将关键字分割为若干等长部分，相加后取后几位作为哈希地址\n5. 除留余数法：取关键字除以一个不大于哈希表长度m的质数p的余数作为哈希地址，H(key)=key%p',
      explanation: '以上五种是常用的哈希函数构造方法，答出任意五种即可。',
      status: 'pending'
    },
    {
      id: 27, year: '2025年4月', type: '解答题',
      chapter: '第六章·图结构',
      title: '含有n个顶点的连通图G的最小生成树有哪些性质？',
      answer: '1. 最小生成树是连通的无环图(树)，包含G的所有n个顶点\n2. 最小生成树恰好有n-1条边，且边的权值总和最小\n3. 若图G的边权值均不相同，则其最小生成树唯一；若存在相同权值，最小生成树可能不唯一\n4. 从最小生成树中删除任意一条边，树变为不连通的两个子图\n5. 向最小生成树中添加任意一条图G的非树边，将形成唯一的一个环，且该环中添加的边权值是环中最大的',
      explanation: '核心性质为：顶点数n、边数n-1、权和最小、连通无环。答出任意5点即可。',
      status: 'pending'
    },
    {
      id: 28, year: '2025年4月', type: '解答题',
      chapter: '第四章·数组、广义表和串',
      title: '设二维数组A[5][6]的每个元素占4个字节，已知数组首地址为1000，A共占多少个字节？分别按行和列优先存储时，A[2][5]的起始地址分别为多少？',
      answer: '已知：每个元素占4字节，首地址LOC(A[0][0])=1000，数组为5行6列。\n\n(1) 数组A总占用字节数：\n总元素数 = 5×6 = 30，总字节数 = 30×4 = 120\n\n(2) 行优先存储的A[2][5]起始地址：\n行优先公式：LOC(A[i][j]) = LOC(A[0][0]) + (i×列数 + j)×每个元素字节数\n代入：i=2, j=5, 列数=6\nLOC = 1000 + (2×6+5)×4 = 1000 + 17×4 = 1068\n\n(3) 列优先存储的A[2][5]起始地址：\n列优先公式：LOC(A[i][j]) = LOC(A[0][0]) + (j×行数 + i)×每个元素字节数\n代入：i=2, j=5, 行数=5\nLOC = 1000 + (5×5+2)×4 = 1000 + 27×4 = 1108',
      explanation: '注意行优先和列优先公式的区别：行优先先算行号×列数，列优先先算列号×行数。',
      status: 'pending'
    },
    {
      id: 29, year: '2025年4月', type: '解答题',
      chapter: '第五章·树与二叉树',
      title: '简述二叉树先序遍历算法的过程。',
      answer: '先序遍历(根左右)是二叉树的深度优先遍历方式。\n\n递归过程：\n1. 访问根结点，读取根结点的信息\n2. 若根结点有左子树，则递归地先序遍历左子树\n3. 若根结点有右子树，则递归地先序遍历右子树\n4. 遍历终止条件：当遍历的子树为空时，直接返回\n\n非递归过程（辅助栈）：\n1. 初始化栈，将根结点入栈\n2. 当栈非空时，弹出栈顶结点并访问\n3. 若该结点有右子树，将右子树根结点入栈（后入先出，保证左子树先遍历）\n4. 若该结点有左子树，将左子树根结点入栈\n5. 重复步骤2-4，直至栈空，遍历完成',
      explanation: '先序遍历的核心是"根-左-右"，递归和非递归过程核心一致。',
      status: 'pending'
    },

    // ========== 四、算法阅读题 (4题×5分=20分) ==========
    {
      id: 30, year: '2025年4月', type: '算法阅读题',
      chapter: '第二章·线性表',
      title: '阅读下列程序，并回答问题：\n\nLinkList mynote(LinkList L)  // L是不带头结点的单链表的头指针\n{\n    if (L && L->next)\n    {\n        q = L;\n        L = L->next;\n        p = L;\n    S1: while (p->next)\n            p = p->next;\n    S2: p->next = q;\n        q->next = NULL;\n    }\n    return L;\n}\n\n(1) 说明语句 S1 及 S2 的功能；\n(2) 设链表表示的线性表为 (a₁, a₂, …, aₙ)，写出算法执行后的返回值所表示的线性表。',
      answer: '(1) 语句功能：\n  S1：遍历单链表，将指针 p 移动到原链表的尾结点（从新头结点 L 开始，循环至 p->next 为空）。\n  S2：将原链表的头结点 q 链接到尾结点 p 之后，再将 q->next 置空，实现原第一个结点移至链表尾部。\n\n(2) 执行后的线性表：\n  原线性表为 (a₁, a₂, …, aₙ)，执行后为 (a₂, a₃, …, aₙ, a₁)，即首元素移至尾部，其余元素顺序不变。',
      explanation: '该算法将不带头结点的单链表的首元素移动到尾部。',
      status: 'pending'
    },
    {
      id: 31, year: '2025年4月', type: '算法阅读题',
      chapter: '第四章·数组、广义表和串',
      title: '阅读下列程序，并回答问题：\n\n#include <stdio.h>\n\nvoid substr(char *t, char *s, int pos, int len)\n{\n    while (len > 0 && *s)\n    {\n        *t = *(s + pos - 1);\n        t++;\n        s++;\n        len--;\n    }\n    *t = \'\\0\';\n}\n\nchar *func(char *s)\n{\n    char t[100];\n    if (strlen(s) <= 1) return s;\n    substr(t, s, 1, 1);\n    substr(s, s, 2, strlen(s) - 1);\n    func(s);\n    return strcat(s, t);\n}\n\n main()\n{\n    char str[100] = "String";\n    printf("%s\\n", func(str));\n    \n}\n\n(1) 请写出执行该程序后的输出结果；\n(2) 简述函数 func 的功能。',
      answer: '(1) 输出结果：\n  gnirtS（即原字符串 "String" 的逆序）\n\n(2) 函数 func 的功能：\n  递归实现字符串的逆序。每次取字符串的第一个字符暂存，将剩余子串递归逆序，再将第一个字符拼接在逆序后子串的尾部，最终得到原字符串的逆序。',
      explanation: 'func函数通过递归方式实现字符串逆序：取出首字符→递归逆序剩余部分→将首字符拼接到尾部。',
      status: 'pending'
    },
    {
      id: 32, year: '2025年4月', type: '算法阅读题',
      chapter: '第三章·栈和队列',
      title: '阅读下列算法，并回答问题：\n\n（注：InitQueue、EnQueue、DeQueue 和 QueueEmpty 分别是队列初始化、入队、出队和判队空的操作）\n\nvoid func(Queue *Q, Queue *Q1, Queue *Q2)\n{\n    int e;\n    InitQueue(Q1);\n    InitQueue(Q2);\n    while (!QueueEmpty(Q))\n    {\n        e = DeQueue(Q);\n        if (e >= 0)\n            EnQueue(Q1, e);\n        else\n            EnQueue(Q2, e);\n    }\n}\n\n(1) Q、Q1 和 Q2 都是队列结构，设队列 Q = (2, 0, -8, 5, -3, -7, 6)（其中 2 为队头元素），写出执行 func(&Q, &Q1, &Q2) 之后队列 Q、Q1 和 Q2 的状态；\n(2) 简述算法 func 的功能。',
      answer: '(1) 执行后各队列状态：\n  Q ：空队列（所有元素均出队，拆分至 Q1、Q2）\n  Q1：(2, 0, 5, 6)，队头为 2（按出队顺序存储所有非负整数）\n  Q2：(-8, -3, -7)，队头为 -8（按出队顺序存储所有负整数）\n\n(2) 算法 func 的功能：\n  将一个整数队列拆分为两个队列：Q1 存储原队列中的所有非负整数，Q2 存储原队列中的所有负整数。拆分后原队列 Q 被置空，且 Q1、Q2 中元素保持原队列的先后相对顺序。',
      explanation: 'func利用队列FIFO特性，将正负元素分别存入不同队列，保持原顺序。',
      status: 'pending'
    },
    {
      id: 33, year: '2025年4月', type: '算法阅读题',
      chapter: '第七章·内部排序',
      title: '下面程序实现折半插入排序算法，请在空白处填上适当内容以将算法补充完整。\n\ntypedef struct {\n    int key;\n    Info otherinfo;\n} SeqList;\n\nvoid InsertSort(SeqList R[], int n)\n{\n    SeqList x;\n    int j, k, lo, hi, mi;\n    for (int i = 2; i <= n; i++)\n    {\n        ①____;\n        lo = 1; hi = i - 1;\n        while (lo <= hi)\n        {\n            mi = (lo + hi) / 2;\n            if (②____) break;\n            if (R[mi].key > x.key)\n                hi = mi - 1;\n            else\n                lo = ③____;\n        }\n        if (mi <= lo)\n            k = ④____;\n        else\n            k = mi - 1;\n        for (j = 0; j < k; j--)\n            ⑥____;\n        R[k] = x;\n    }\n}',
      answer: '各空填写如下：\n  ① x = R[i]          —— 将待插入元素暂存到 x 中\n  ② R[mi].key == x.key —— 折半查找找到相等元素，直接跳出循环\n  ③ mi + 1            —— 待插入元素比中间元素大，在右半区继续查找\n  ④ mi                —— 确定插入位置（循环结束时 lo 为插入点）\n  ⑤ i                 —— 从 i 位置开始向前移动元素\n  ⑥ R[j] = R[j-1]     —— 将元素后移一位，为插入腾出位置',
      explanation: '该算法为折半插入排序，利用折半查找确定插入位置，再移动元素完成插入。',
      status: 'pending'
    },

    // ========== 五、算法设计题 (1题×10分=10分) ==========
    {
      id: 34, year: '2025年4月', type: '算法设计题',
      chapter: '第六章·图结构',
      title: '无向图 G 采用邻接矩阵存储，存储定义如下：\n\n#define MAXV 50   // 最大顶点个数\ntypedef struct {\n    int arcs[MAXV][MAXV];  // 邻接矩阵，顶点关系 (0 或 1)\n    int vexnum, arcnum;    // 顶点数, 边数\n    VertexType vexs[MAXV]; // 存放顶点信息\n} MGraph;\n\n设计算法求图 G 中顶点度的最大值。\n(1) 给出算法的基本设计思想。（4 分）\n(2) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。（6 分）',
      answer: '(1) 算法基本设计思想：\n  ① 无向图的邻接矩阵为对称矩阵，顶点 vi 的度等于邻接矩阵中第 i 行（或第 i 列）值为 1 的元素个数；\n  ② 初始化最大度 max_degree 为 0，遍历邻接矩阵的每一个顶点（每一行）；\n  ③ 对每个顶点 vi，统计其所在行中 1 的个数，记为 cur_degree（当前顶点的度）；\n  ④ 若 cur_degree > max_degree，则更新 max_degree = cur_degree；\n  ⑤ 遍历完所有顶点后，max_degree 即为图 G 中顶点度的最大值。\n\n(2) C 语言描述算法：\nint MaxVertexDegree(MGraph G)\n{\n    int max_degree = 0;        // 初始化最大度为 0\n    int i, j;\n    for (i = 0; i < G.vexnum; i++)       // 遍历每个顶点\n    {\n        int cur_degree = 0;    // 当前顶点的度\n        for (j = 0; j < G.vexnum; j++)   // 统计第 i 行 1 的个数\n        {\n            if (G.arcs[i][j] == 1)\n                cur_degree++;\n        }\n        if (cur_degree > max_degree)     // 更新最大度\n            max_degree = cur_degree;\n    }\n    return max_degree;         // 返回顶点度的最大值\n}\n\n复杂度分析：时间复杂度 O(n²)（n 为顶点数，双层循环遍历邻接矩阵），空间复杂度 O(1)（仅使用常数个辅助变量）。',
      explanation: '无向图邻接矩阵中，顶点vi的度 = 第i行（或第i列）1的个数。遍历所有行取最大值即可。',
      status: 'pending'
    },

    // ============================================================
    // ========== 2024年10月真题 ==========
    // ============================================================

    // ========== 一、单项选择题 (15题×2分=30分) ==========
    {
      id: 35, year: '2024年10月', type: '选择题',
      chapter: '第一章·绪论',
      title: '下列任何两个结点之间都没有逻辑关系的是',
      options: ['A. 图形结构', 'B. 线性结构', 'C. 集合', 'D. 树形结构'],
      answer: 'C',
      explanation: '集合结构中元素间无任何逻辑关系，线性/树形/图形结构均有明确逻辑关系。',
      status: 'pending'
    },
    {
      id: 36, year: '2024年10月', type: '选择题',
      chapter: '第一章·绪论',
      title: '下列选项中，定义抽象数据类型时不需要做的事情是',
      options: ['A. 给出类型的名字', 'B. 定义类型上的操作', 'C. 实现类型上的操作', 'D. 用某种语言描述抽象数据类型'],
      answer: 'C',
      explanation: '抽象数据类型仅定义逻辑特性和操作接口，不涉及具体实现，实现是具体编程环节。',
      status: 'pending'
    },
    {
      id: 37, year: '2024年10月', type: '选择题',
      chapter: '第二章·线性表',
      title: '在单链表L中，已知q所指结点是p所指结点的前驱结点，next是结点的指针域，若在q和p之间插入s所指结点，则执行的操作是',
      options: ['A. s->next=p->next; p->next=s', 'B. p->next=s->next; s->next=p', 'C. p->next=s; s->next=q', 'D. q->next=s; s->next=p'],
      answer: 'D',
      explanation: '单链表插入：先让新结点s指向后继p，再让前驱q指向新结点s，不可颠倒。',
      status: 'pending'
    },
    {
      id: 38, year: '2024年10月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '元素a、b、c、d、e依次进入初始为空的栈中，在所有可能的出栈序列中，以元素d开头的序列个数是',
      options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
      answer: 'B',
      explanation: 'd开头说明a、b、c、d已入栈且d出栈，剩余e可在任意位置出栈，序列为decb a、dceba、dcbea、dcbae，共4种。',
      status: 'pending'
    },
    {
      id: 39, year: '2024年10月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '读入数据元素序列a,b,c,d,e,f,g并入栈，下列选项中，不可能是出栈序列的是',
      options: ['A. f,e,g,d,a,c,b', 'B. c,d,b,e,f,a,g', 'C. e,b,d,g,c,b,a', 'D. d,e,c,f,b,g,a'],
      answer: 'A',
      explanation: '栈先进后出，A中出栈f、e后，栈内为a、b、c、d，下一出栈g说明g已入栈，此时栈内从顶到底为g、d、c、b、a，后续出d后应出c、b，而非a，违反栈特性。',
      status: 'pending'
    },
    {
      id: 40, year: '2024年10月', type: '选择题',
      chapter: '第三章·栈和队列',
      title: '若以1,2,3,4作为双端队列的输入序列，则既不能由输入受限的双端队列得到，又不能由输出受限的双端队列得到的输出序列是',
      options: ['A. 1,2,3,4', 'B. 4,1,3,2', 'C. 4,2,3,1', 'D. 4,2,1,3'],
      answer: 'C',
      explanation: '输入/输出受限的双端队列均无法得到4,2,3,1；4,1,3,2可由输出受限得到，4,2,1,3可由输入受限得到。',
      status: 'pending'
    },
    {
      id: 41, year: '2024年10月', type: '选择题',
      chapter: '第四章·数组、广义表和串',
      title: '广义表A=(a,b,(c,d,(e,(f,g))))，则Head(Tail(Head(Tail(Tail(A)))))的值为',
      options: ['A. (g)', 'B. (f,g)', 'C. c', 'D. d'],
      answer: 'D',
      explanation: '分步计算：Tail(A)=(b,(c,d,(e,(f,g))))，Tail(Tail(A))=((c,d,(e,(f,g))))，Head(Tail(Tail(A)))=(c,d,(e,(f,g)))，Tail(Head(...))=(d,(e,(f,g)))，Head(Tail(...))=d。',
      status: 'pending'
    },
    {
      id: 42, year: '2024年10月', type: '选择题',
      chapter: '第四章·数组、广义表和串',
      title: '若串S="software"，其子串的数目是',
      options: ['A. 8', 'B. 9', 'C. 36', 'D. 37'],
      answer: 'D',
      explanation: '串长为n时，子串数为n(n+1)/2+1（含空串），"software"长8，子串数=8×9/2+1=37。',
      status: 'pending'
    },
    {
      id: 43, year: '2024年10月', type: '选择题',
      chapter: '第二章·线性表',
      title: '带头结点的单链表的头指针为head，表为空的判定条件是',
      options: ['A. head==NULL', 'B. head->next==NULL', 'C. head!=NULL', 'D. head->next==head'],
      answer: 'B',
      explanation: '带头结点单链表，头结点始终存在，表空判定为头结点的next指针为NULL。',
      status: 'pending'
    },
    {
      id: 44, year: '2024年10月', type: '选择题',
      chapter: '第四章·数组、广义表和串',
      title: '稀疏矩阵的存储结构中，除存储三元组线性表的所有元素外，还包括',
      options: ['A. 稀疏矩阵的所有零元素及其位置', 'B. 稀疏矩阵的行数、列数及非零元素的个数', 'C. 三元组线性表元素之间的关系', 'D. 矩阵元素的数据类型'],
      answer: 'B',
      explanation: '稀疏矩阵三元组存储需记录行数、列数、非零元素个数+各非零元素的行、列、值。',
      status: 'pending'
    },
    {
      id: 45, year: '2024年10月', type: '选择题',
      chapter: '第八章·查找',
      title: '对n个元素的表做顺序查找时，若查找每个元素的概率相同，则平均查找长度为',
      options: ['A. (n+1)/2', 'B. n/2', 'C. n', 'D. (n-1)/2'],
      answer: 'A',
      explanation: '顺序查找平均查找长度ASL=(n+1)/2，每个元素查找概率相同。',
      status: 'pending'
    },
    {
      id: 46, year: '2024年10月', type: '选择题',
      chapter: '第五章·树与二叉树',
      title: '二叉树的先序遍历序列是abdgcefh，中序遍历序列是dgbaechf，则其后序遍历序列是',
      options: ['A. gdbehfca', 'B. abcdefgh', 'C. gdbaefch', 'D. ghbcdefa'],
      answer: 'A',
      explanation: '由先序(abdgcefh)和中序(dgbaechf)推二叉树结构，后序遍历为左右根的逆序，最终得gdbehfca。',
      status: 'pending'
    },
    {
      id: 47, year: '2024年10月', type: '选择题',
      chapter: '第六章·图结构',
      title: '在一个具有n个顶点的有向图中，所有顶点的出度之和为d，则所有顶点的入度之和为',
      options: ['A. n', 'B. d-1', 'C. d', 'D. d+1'],
      answer: 'C',
      explanation: '有向图的基本性质：所有顶点的入度之和=出度之和=边的总数。',
      status: 'pending'
    },
    {
      id: 48, year: '2024年10月', type: '选择题',
      chapter: '第八章·查找',
      title: '对线性表进行二分查找时，要求线性表必须',
      options: ['A. 以顺序方式存储', 'B. 以顺序方式存储且元素有序', 'C. 以链式方式存储', 'D. 以链式方式存储且元素有序'],
      answer: 'B',
      explanation: '二分查找要求线性表顺序存储+元素有序，链式存储无法实现随机访问，不能用二分查找。',
      status: 'pending'
    },
    {
      id: 49, year: '2024年10月', type: '选择题',
      chapter: '第七章·内部排序',
      title: '下列排序方法中，辅助空间为O(n)的是',
      options: ['A. 希尔排序', 'B. 堆排序', 'C. 选择排序', 'D. 归并排序'],
      answer: 'D',
      explanation: '归并排序辅助空间O(n)；希尔排序、堆排序、选择排序辅助空间均为O(1)。',
      status: 'pending'
    },

    // ========== 二、填空题 (10题×2分=20分) ==========
    {
      id: 50, year: '2024年10月', type: '填空题',
      chapter: '第一章·绪论',
      title: '在数据结构中，____是数据元素之间存在着先后次序关系的结构。',
      answer: '线性结构',
      explanation: '线性结构元素间存在一对一的先后次序关系，树形为一对多，图形为多对多。',
      status: 'pending'
    },
    {
      id: 51, year: '2024年10月', type: '填空题',
      chapter: '第二章·线性表',
      title: '设顺序表的每个元素占8个存储单元。若第1个元素的存储首地址为100，则第6个元素占用的最后一个存储单元的地址是____。',
      answer: '147',
      explanation: '第6个元素首地址=100+(6-1)×8=140，最后一个存储单元地址=140+7=147。',
      status: 'pending'
    },
    {
      id: 52, year: '2024年10月', type: '填空题',
      chapter: '第二章·线性表',
      title: '在数组中保存的链表称为____。',
      answer: '静态链表',
      explanation: '用数组模拟链表，结点含数据域和游标（模拟指针），称为静态链表。',
      status: 'pending'
    },
    {
      id: 53, year: '2024年10月', type: '填空题',
      chapter: '第六章·图结构',
      title: '在图的存储结构中，链式存储结构以____为代表。',
      answer: '邻接表',
      explanation: '图的链式存储以邻接表为代表，顺序存储以邻接矩阵为代表。',
      status: 'pending'
    },
    {
      id: 54, year: '2024年10月', type: '填空题',
      chapter: '第四章·数组、广义表和串',
      title: '广义表G=(a,b,(c,d,(e,f)),g)的长度为____。',
      answer: '4',
      explanation: '广义表的长度为最外层元素的个数，G的最外层元素为a、b、(c,d,(e,f))、g，共4个。',
      status: 'pending'
    },
    {
      id: 55, year: '2024年10月', type: '填空题',
      chapter: '第三章·栈和队列',
      title: '链式队列采用带头指针及尾指针的____作为队列的存储结构。',
      answer: '单链表',
      explanation: '链式队列通常采用带头指针和尾指针的单链表存储，头指针指队头，尾指针指队尾。',
      status: 'pending'
    },
    {
      id: 56, year: '2024年10月', type: '填空题',
      chapter: '第五章·树与二叉树',
      title: '一棵二叉树共有20个结点，其中叶结点为5个，则度为1的结点的个数是____。',
      answer: '11',
      explanation: '二叉树性质：n0=n2+1，已知n0=5则n2=4，n=n0+n1+n2，得n1=20-5-4=11。',
      status: 'pending'
    },
    {
      id: 57, year: '2024年10月', type: '填空题',
      chapter: '第七章·内部排序',
      title: '影响排序效率的两个因素是关键字的____次数和记录的移动次数。',
      answer: '比较',
      explanation: '排序效率由关键字比较次数和记录移动次数两个核心因素决定。',
      status: 'pending'
    },
    {
      id: 58, year: '2024年10月', type: '填空题',
      chapter: '第七章·内部排序',
      title: '若用起泡排序方法对序列11,15,27,29,42,53进行降序排序，则需要进行比较操作的次数是____。',
      answer: '15',
      explanation: '起泡排序降序排序，n个元素需进行n(n-1)/2次比较，本题n=6，得6×5/2=15。',
      status: 'pending'
    },
    {
      id: 59, year: '2024年10月', type: '填空题',
      chapter: '第六章·图结构',
      title: '若连通图的顶点个数是n，则该图的最小生成树的边数是____。',
      answer: 'n-1',
      explanation: '连通图的最小生成树是含所有n个顶点的极小连通子图，恰好有n-1条边。',
      status: 'pending'
    },

    // ========== 三、解答题 (4题×5分=20分) ==========
    {
      id: 60, year: '2024年10月', type: '解答题',
      chapter: '第八章·查找',
      title: '构造哈希函数时通常考虑的因素有哪些？',
      answer: '构造哈希函数时通常考虑以下因素：\n\n1. 哈希表的长度：除留余数法中除数需小于等于哈希表长度，且取质数；\n2. 关键字的特性：根据关键字的类型（数字/字符）、位数、分布规律选择方法；\n3. 哈希地址的均匀性：尽可能使哈希地址均匀分布，减少哈希冲突；\n4. 计算的简便性：哈希函数计算要简单高效，降低时间开销；\n5. 冲突处理方式：哈希函数的构造需与冲突处理方法（开放定址/链地址）适配。',
      explanation: '哈希函数构造需综合考虑表长、关键字特性、均匀性、计算效率和冲突处理方式。',
      status: 'pending'
    },
    {
      id: 61, year: '2024年10月', type: '解答题',
      chapter: '第一章·绪论',
      title: '简述算法的五个特性。',
      answer: '算法是解决问题的有限步骤集合，具有以下五个基本特性：\n\n1. 有穷性：算法执行有限步后必终止，不能无限循环；\n2. 确定性：算法的每一步操作都有明确的定义，无歧义；\n3. 可行性：算法的每一步运算都是基本运算，能精确执行并得到确定结果；\n4. 输入性：算法有0个或多个输入，来自指定的数据集；\n5. 输出性：算法有1个或多个输出，是算法执行的结果，无输出的算法无意义。',
      explanation: '算法五特性：有穷性、确定性、可行性、输入性、输出性。',
      status: 'pending'
    },
    {
      id: 62, year: '2024年10月', type: '解答题',
      chapter: '第六章·图结构',
      title: '若无向图G中含有n个顶点和e条边，则它的邻接矩阵中0的个数是多少？',
      answer: '无向图的邻接矩阵为n阶方阵（n为顶点数），总元素个数为n²；\n无向图中边数e对应邻接矩阵中2e个1（对称矩阵，(i,j)和(j,i)均为1）；\n因此邻接矩阵中0的个数为：n² - 2e。',
      explanation: '邻接矩阵总元素n²，非零元素（1）有2e个（对称），其余为0。',
      status: 'pending'
    },
    {
      id: 63, year: '2024年10月', type: '解答题',
      chapter: '第三章·栈和队列',
      title: '设5个元素1、2、3、4、5依次入栈，以push(x)表示x入栈，pop(x)表示x出栈，写出得到出栈序列2、1、4、3、5的操作过程。',
      answer: '入栈顺序为1,2,3,4,5，栈操作（push=入栈，pop=出栈）如下：\n\npush(1) → push(2) → pop(2) → pop(1) → push(3) → push(4) → pop(4) → pop(3) → push(5) → pop(5)',
      explanation: '依次入栈1、2后立即出栈得到2、1；再入栈3、4后出栈得到4、3；最后入栈5出栈得到5。',
      status: 'pending'
    },

    // ========== 四、算法阅读题 (4题×5分=20分) ==========
    {
      id: 64, year: '2024年10月', type: '算法阅读题',
      chapter: '第二章·线性表',
      title: '程序的功能是返回指针curr指向结点的位置，请在空白处填上适当内容以将算法补充完整。\n\nPosition func(LinkList *head, LinkNode *curr)\n{\n    LinkNode *temp = *head;\n    int count = 0;\n    if (*head == NULL ①__ curr == NULL)\n    {\n        printf("指针无效\\n");\n        return ②__;\n    }\n    while (temp != curr && temp != NULL)\n    {\n        temp = ③__;\n        ④__;\n    }\n    return ⑤__;\n}',
      answer: '各空填写如下：\n  ① ||        —— 逻辑或，判断头指针或目标指针无效\n  ② -1        —— 指针无效时返回 -1，标识查找失败\n  ③ temp->next —— 遍历单链表，指针后移\n  ④ count++   —— 统计结点位置，每遍历一个结点计数+1\n  ⑤ count     —— 遍历找到目标结点，返回其位置',
      explanation: '单链表结点位置查找：从头指针开始遍历，计数器记录位置，找到目标结点返回位置号。',
      status: 'pending'
    },
    {
      id: 65, year: '2024年10月', type: '算法阅读题',
      chapter: '第二章·线性表',
      title: '已知线性表的存储结构为顺序表，阅读下列算法，并回答问题：\n\nvoid func(SeqList *L)\n{\n    int i, j;\n    for (i = 0, j = 0; i < L->length; i++)\n    {\n        if (L->data[i] >= 0)\n        {\n          if(i!=j)\n            L->data[j] = L->data[i];\n            j++;\n        }\n    }\n    L->length = j;\n}\n\n(1) 设线性表L=(19,-6,-9,26,0,-21,74,35,-30)，写出执行func(&L)后的L的状态；\n(2) 简述算法func的功能。',
      answer: '(1) 执行后L的状态：\n  原L=(19,-6,-9,26,0,-21,74,35,-30)，算法筛选非负元素并保留相对顺序，执行后：\n  L=(19,26,0,74,35)，长度为5。\n\n(2) 算法func的功能：\n  遍历顺序表，筛选出所有非负元素，将其依次存放在顺序表的前端，保持非负元素的相对顺序不变，最后修改顺序表的长度为非负元素的个数，删除所有负元素。',
      explanation: '双指针法筛选：j指向非负元素存放位置，遍历一遍后截断长度。',
      status: 'pending'
    },
    {
      id: 66, year: '2024年10月', type: '算法阅读题',
      chapter: '第八章·查找',
      title: '已知顺序表的表结构定义如下：\n\n#define MAXLEN 100\ntypedef int KeyType;\ntypedef struct\n{\n    KeyType key;\n    InfoType otherinfo;\n} NodeType;\ntypedef NodeType SqList[MAXLEN];\n\n阅读下列程序，并回答问题：\n\nint func(SqList R, NodeType X, int p, int q)\n{\n    int m;\n    if (p > q) return -1;\n    m = (p + q) / 2;\n    if (R[m].key == X.key)\n        return m;\n    if (R[m].key > X.key)\n        return func(R, X, p, m - 1);\n    else\n        return func(R, X, m + 1, q);\n}\n\n(1) 若顺序表R的关键字序列为(3,6,15,28,53,70,115)，分别写出X.key=19和X.key=28时，执行函数调用func(R,X,0,6)的函数返回值；\n(2) 简述算法func的功能。',
      answer: '(1) 函数返回值：\n  X.key=19：顺序表中无此关键字，返回 -1；\n  X.key=28：顺序表中该关键字在索引3的位置，返回 3。\n\n(2) 算法func的功能：\n  采用递归方式实现二分查找，在有序的顺序表R中查找关键字为X.key的元素，若找到则返回其在顺序表中的索引位置；若未找到则返回-1（查找失败）。',
      explanation: '递归二分查找：每次比较中间元素，根据大小关系在左半区或右半区继续递归查找。',
      status: 'pending'
    },
    {
      id: 67, year: '2024年10月', type: '算法阅读题',
      chapter: '第七章·内部排序',
      title: '阅读下列算法，并回答问题：\n\nvoid func(int r[], int n)\n{\n    int i, j;\n    for (i = 2; i <= n; i++)\n    {\n        r[0] = r[i];\n        j = i - 1;\n        while (r[0] < r[j])\n        {\n            r[j + 1] = r[j];\n            j--;\n        }\n        r[j + 1] = r[0];\n    }\n}\n\n(1) 这是哪一种插入排序算法？该算法是否稳定？\n(2) 设置r[0]的作用是什么？',
      answer: '(1) 算法类型及稳定性：\n  该算法是直接插入排序；直接插入排序是稳定的排序算法（相同关键字的元素相对顺序不变）。\n\n(2) 设置r[0]的作用：\n  r[0]作为哨兵（临时存储单元），存放待插入的元素r[i]：\n  1. 避免待插入元素在移动过程中被覆盖；\n  2. 简化循环条件，无需判断j是否越界（j>1即可），提高算法效率。',
      explanation: 'r[0]兼做暂存和哨兵，省去越界判断，是直接插入排序的经典优化技巧。',
      status: 'pending'
    },

    // ========== 五、算法设计题 (1题×10分=10分) ==========
    {
      id: 68, year: '2024年10月', type: '算法设计题',
      chapter: '第五章·树与二叉树',
      title: '存储二叉树的二叉链表定义如下：\n\ntypedef struct node\n{\n    char data;\n    struct node *lchild, *rchild;\n} BinTNode;\ntypedef BinTNode *BinTree;\n\n请编写一个后序遍历二叉树的递归程序 void PostOrder(BinTree root)，并输出遍历序列。其中root指向二叉树根结点。',
      answer: '设计思想：\n  后序遍历遵循"左子树→右子树→根结点"的遍历顺序，递归终止条件为：当根结点为NULL时直接返回；否则依次递归遍历左子树、右子树，最后访问根结点（输出数据）。\n\nC语言实现代码（带注释）：\n\nvoid PostOrder(BinTree root)\n{\n    if (root == NULL)              // 递归终止条件：空树直接返回\n        return;\n    PostOrder(root->lchild);      // 递归遍历左子树\n    PostOrder(root->rchild);      // 递归遍历右子树\n    printf("%c ", root->data);    // 访问根结点，输出数据\n}\n\n算法说明：\n  1. 时间复杂度：O(n)（n为二叉树结点数，每个结点被访问一次）；\n  2. 空间复杂度：O(h)（h为二叉树的高度，递归调用的栈深度为树的高度，最坏情况h=n）；\n  3. 稳定性：递归遍历天然保证后序的顺序要求，代码简洁且符合考试答题规范。',
      explanation: '后序遍历递归：先左后右再根，递归终止条件为空指针返回。',
      status: 'pending'
    }
  ]
};
