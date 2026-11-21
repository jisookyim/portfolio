// Cycles the From → To pairs in the hero.
// Each .hero contains one or more [data-cycle] stacks, all with the same number of values.
// Respects prefers-reduced-motion: shows the first pair and stops.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".hero").forEach(function (hero) {
    var stacks = hero.querySelectorAll("[data-cycle]");
    if (!stacks.length) return;

    var count = stacks[0].children.length;
    if (count < 2 || reduce) return;

    var interval = Number(hero.dataset.interval) || 2600;
    var i = 0;

    setInterval(function () {
      i = (i + 1) % count;
      stacks.forEach(function (stack) {
        Array.prototype.forEach.call(stack.children, function (el, j) {
          el.classList.toggle("is-active", j === i);
        });
      });
    }, interval);
  });
})();
