// Stamp postcards: one shared postcard viewer for every passport stamp. Content comes from content/stamps.json.
// Click, tap or Enter opens it over a dark overlay. Arrow keys move through the postcards.
// Esc, the close button or clicking the overlay closes it and returns focus to the stamp.
(function () {
  var source = document.getElementById("stamp-data");
  if (!source) return;
  var data = JSON.parse(source.textContent);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var postageColors = ["--coral", "--signal-yellow", "--pink", "--mint"];
  var planePath = "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";
  var key = null, index = 0, trigger = null, busy = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function button(className, label, text) {
    var node = el("button", className, text);
    node.type = "button";
    node.setAttribute("aria-label", label);
    return node;
  }

  var overlay = el("div", "pc-overlay");
  overlay.hidden = true;
  var pop = el("div", "pc-pop");
  pop.tabIndex = -1;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-modal", "true");
  var closeButton = button("pc-btn pc-close", "Close postcards", "×");
  var card = el("div", "pc-card");
  var foot = el("div", "pc-foot");
  var link = el("a", "pc-link");
  link.target = "_blank";
  link.rel = "noopener";
  var nav = el("div", "pc-nav");
  var prev = button("pc-btn", "Previous postcard", "←");
  var count = el("span", "pc-count");
  var next = button("pc-btn", "Next postcard", "→");
  nav.append(prev, count, next);
  foot.append(link, nav);
  var live = el("span", "sr-only");
  live.setAttribute("aria-live", "polite");
  pop.append(closeButton, card, foot, live);
  overlay.append(pop);
  document.body.appendChild(overlay);

  // decorative stamp and postmark, shared by every postcard
  function postmarks(item, background) {
    var postage = el("span", "pc-postage");
    postage.style.background = background;
    postage.setAttribute("aria-hidden", "true");
    postage.innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" focusable="false"><path transform="rotate(45 12 12)" d="' + planePath + '"/></svg>';
    var postmark = el("span", "pc-postmark", item.mark);
    postmark.setAttribute("aria-hidden", "true");
    return [postage, postmark];
  }

  function playVideo(postcard, box, item) {
    var iframe = el("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(item.id) + "?autoplay=1&rel=0";
    iframe.title = item.title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    postcard.classList.add("is-playing");
    box.replaceChildren(iframe);
    iframe.focus();
  }

  function letter(item) {
    var postcard = el("figure", "pc-postcard pc-letter");
    var message = el("div", "pc-message");
    message.append(el("blockquote", "", "“" + item.quote + "”"), el("p", "pc-sign", "— " + item.sign));
    var address = el("figcaption", "pc-address");
    postmarks(item, "var(" + postageColors[index % postageColors.length] + ", var(--grey))").forEach(function (node) { address.append(node); });
    address.append(el("p", "pc-from-label", "From"), el("span", "pc-from-line is-name", item.name));
    item.title.split(", ").forEach(function (part) { address.append(el("span", "pc-from-line", part)); });
    postcard.append(message, address);
    return postcard;
  }

  function pictureCard(item) {
    var postcard = el("figure", "pc-postcard");
    var picture = el("div", "pc-picture");
    if (item.type === "video") {
      var box = el("div", "pc-video-box");
      var play = button("pc-play", "Play video: " + item.title);
      var poster = el("img");
      poster.src = item.poster;
      poster.alt = "";
      var icon = el("span", "pc-play-icon");
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" focusable="false"><path d="M8 5v14l11-7z"/></svg>';
      play.append(poster, icon);
      play.addEventListener("click", function () { playVideo(postcard, box, item); });
      box.append(play);
      picture.append(box);
    } else {
      var img = el("img");
      img.src = item.src;
      img.alt = item.alt;
      picture.append(img);
    }
    var back = el("figcaption", "pc-back");
    postmarks(item, "var(--deck)").forEach(function (node) { back.append(node); });
    if (item.note) back.append(el("p", "pc-note", item.note));
    if (item.caption) back.append(el("p", "pc-place", item.caption));
    postcard.append(picture, back);
    return postcard;
  }

  function renderCard() {
    var cards = data[key].cards, item = cards[index];
    card.replaceChildren(item.type === "quote" ? letter(item) : pictureCard(item));
    count.textContent = (index + 1) + " of " + cards.length;
    live.textContent = "Postcard " + (index + 1) + " of " + cards.length;
    var upcoming = cards[(index + 1) % cards.length];
    if (upcoming.type === "photo") new Image().src = upcoming.src;
  }

  function setPageLocked(locked) {
    var root = document.documentElement;
    document.querySelectorAll("body > header, body > main, body > footer").forEach(function (part) { part.inert = locked; });
    if (locked) {
      var scrollbar = window.innerWidth - root.clientWidth;
      root.style.overflow = "hidden";
      document.body.style.paddingRight = scrollbar ? scrollbar + "px" : "";
    } else {
      root.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }

  function open(name, control) {
    key = name;
    trigger = control;
    index = 0;
    var entry = data[key];
    pop.dataset.stamp = key;
    pop.setAttribute("aria-label", entry.open_label.replace(/^Open /, ""));
    pop.classList.toggle("is-single", entry.cards.length < 2);
    link.hidden = !entry.link;
    if (entry.link) { link.href = entry.link.href; link.textContent = entry.link.text + " ↗"; } // the arrow stays with the last word
    renderCard();
    setPageLocked(true);
    overlay.hidden = false;
    control.setAttribute("aria-expanded", "true");
    (entry.cards.length > 1 ? next : closeButton).focus({ preventScroll: true });
  }

  function close() {
    if (key === null) return;
    var last = trigger;
    overlay.hidden = true;
    card.replaceChildren(); // also stops a playing video
    setPageLocked(false);
    last.setAttribute("aria-expanded", "false");
    key = null; trigger = null; busy = false;
    last.focus({ preventScroll: true });
  }

  function move(step) {
    if (key === null || busy) return;
    var total = data[key].cards.length;
    if (total < 2) return;
    function swap() {
      if (key === null) return;
      index = (index + step + total) % total;
      renderCard();
      card.classList.remove("leaving-next", "leaving-prev");
      busy = false;
    }
    if (reduce.matches) { swap(); return; }
    busy = true;
    card.classList.add(step > 0 ? "leaving-prev" : "leaving-next");
    setTimeout(swap, 140);
  }

  document.querySelectorAll("[data-stamp]").forEach(function (stamp) {
    var name = stamp.getAttribute("data-stamp");
    if (!data[name]) return;
    var control = button("stamp-trigger", data[name].open_label);
    control.setAttribute("aria-haspopup", "dialog");
    control.setAttribute("aria-expanded", "false");
    control.addEventListener("click", function () { open(name, control); });
    stamp.appendChild(control);
  });

  overlay.addEventListener("click", function (event) { if (event.target === overlay) close(); });
  closeButton.addEventListener("click", close);
  prev.addEventListener("click", function () { move(-1); });
  next.addEventListener("click", function () { move(1); });

  document.addEventListener("keydown", function (event) {
    if (key === null) return;
    if (event.key === "Escape") { close(); return; }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); return; }
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); return; }
    if (event.key === "Tab") {
      var stops = Array.prototype.filter.call(pop.querySelectorAll("button, a[href], iframe"), function (node) {
        return node.offsetParent !== null;
      });
      var first = stops[0], last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
