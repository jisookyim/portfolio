// Cycles the From and To values inside the passport. Respects prefers-reduced-motion.
(function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var stacks = document.querySelectorAll("[data-cycle]");
    var i = 0;
    setInterval(function () {
      i = (i + 1) % 3;
      stacks.forEach(function (stack) {
        Array.prototype.forEach.call(stack.children, function (el, j) {
          el.classList.toggle("is-active", j === i);
        });
      });
    }, 2600);
  })();
