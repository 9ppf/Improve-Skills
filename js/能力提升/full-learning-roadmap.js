// ============================================================
// full-learning-roadmap 页面 JS
// 抽离自 full-learning-roadmap.html
// ============================================================

// 滚动时更新导航栏激活状态
    (function() {
      const navLinks = document.querySelectorAll('.phase-nav a');
      const sections = ['phase-a', 'phase-b', 'phase-c', 'phase-d', 'method', 'next'].map(id => document.getElementById(id));

      function onScroll() {
        const scrollPos = window.scrollY + 120;
        let activeIndex = -1;
        sections.forEach((sec, i) => {
          if (sec && sec.offsetTop <= scrollPos) activeIndex = i;
        });
        navLinks.forEach((link, i) => {
          link.classList.toggle('active', i === activeIndex);
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
