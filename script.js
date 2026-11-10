(function () {
  var STORAGE_KEY = "go-lang";
  var titles = {
    en: "Gupta Optician | Dewas, Madhya Pradesh",
    hi: "गुप्ता ऑप्टिशियन | देवास, मध्य प्रदेश"
  };
  var descriptions = {
    en: "Gupta Optician is an optical shop in Dewas, Madhya Pradesh, with a flagship store in Alankar Market on MG Road and a new store on AB Road, near Abhilasha Hotel.",
    hi: "गुप्ता ऑप्टिशियन देवास, मध्य प्रदेश की ऑप्टिकल दुकान है। मुख्य दुकान एम.जी. रोड, अलंकार मार्केट में है, और नई दुकान ए.बी. रोड पर, अभिलाषा होटल के पास है।"
  };

  function currentLang() {
    var lang = document.documentElement.lang;
    return lang === "hi" ? "hi" : "en";
  }

  function readStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "hi" || stored === "en") return stored;
    } catch (e) { /* ignore */ }
    return ((navigator.language || "").toLowerCase().indexOf("hi") === 0) ? "hi" : "en";
  }

  function setMeta(name, value, property) {
    var attr = property ? "property" : "name";
    var el = document.querySelector("meta[" + attr + "='" + name + "']");
    if (el) el.setAttribute("content", value);
  }

  function applyLang(lang) {
    if (lang !== "hi" && lang !== "en") lang = "en";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    document.title = titles[lang];
    setMeta("description", descriptions[lang], false);
    setMeta("og:title", titles[lang], true);
    setMeta("og:description", descriptions[lang], true);
    setMeta("og:locale", lang === "hi" ? "hi_IN" : "en_IN", true);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-aria-en]").forEach(function (el) {
      var value = el.getAttribute(lang === "hi" ? "data-aria-hi" : "data-aria-en");
      if (!value) return;
      if (el.hasAttribute("aria-label") || el.tagName === "A" || el.tagName === "BUTTON" || el.tagName === "NAV") {
        if (el.tagName === "NAV" || el.tagName === "SECTION") {
          el.setAttribute("aria-label", value);
        } else if (el.classList.contains("nav-toggle")) {
          var open = el.getAttribute("aria-expanded") === "true";
          var label = open
            ? el.getAttribute(lang === "hi" ? "data-aria-open-hi" : "data-aria-open-en")
            : value;
          el.setAttribute("aria-label", label);
        } else {
          el.setAttribute("aria-label", value);
        }
      }
    });

    document.querySelectorAll("[data-alt-en]").forEach(function (el) {
      el.setAttribute("alt", el.getAttribute(lang === "hi" ? "data-alt-hi" : "data-alt-en"));
    });

    var group = document.querySelector(".lang-switch");
    if (group) {
      group.setAttribute("aria-label", lang === "hi" ? "भाषा" : "Language");
    }

    var brand = document.querySelector(".brand");
    if (brand) {
      brand.setAttribute("aria-label", lang === "hi" ? "गुप्ता ऑप्टिशियन, मुख्य पृष्ठ" : "Gupta Optician home");
    }

    updateHoursStatus();
    updateNavToggleLabel();
  }

  function updateNavToggleLabel() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) return;
    var lang = currentLang();
    var open = toggle.getAttribute("aria-expanded") === "true";
    var label = open
      ? toggle.getAttribute(lang === "hi" ? "data-aria-open-hi" : "data-aria-open-en")
      : toggle.getAttribute(lang === "hi" ? "data-aria-hi" : "data-aria-en");
    if (label) toggle.setAttribute("aria-label", label);
  }

  var year = String(new Date().getFullYear());
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = year;
  });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      updateNavToggleLabel();
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      updateNavToggleLabel();
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"));
    });
  });

  function nowInKolkata() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") map[part.type] = part.value;
    });
    var weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
    return { weekday: weekday, minutes: Number(map.hour) * 60 + Number(map.minute) };
  }

  function formatTime(mins, lang) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var clock = (h % 12 || 12) + ":" + String(m).padStart(2, "0");
    if (lang === "hi") {
      var period = h < 12 ? "सुबह" : (h < 17 ? "दोपहर" : (h < 20 ? "शाम" : "रात"));
      return period + " " + clock;
    }
    return clock + " " + (h >= 12 ? "PM" : "AM");
  }

  function rangeFor(store, weekday) {
    return weekday === 0 ? store.sun : store.week;
  }

  var hours = {
    alankar: { week: [10 * 60 + 30, 20 * 60 + 30], sun: [11 * 60, 19 * 60] },
    abroad: { week: [10 * 60 + 30, 21 * 60], sun: [11 * 60, 20 * 60] }
  };

  function updateHoursStatus() {
    var lang = currentLang();
    var now = nowInKolkata();
    document.querySelectorAll(".status[data-store]").forEach(function (el) {
      var store = hours[el.getAttribute("data-store")];
      if (!store) return;
      var today = rangeFor(store, now.weekday);
      el.classList.remove("open", "closed");
      if (now.minutes >= today[0] && now.minutes < today[1]) {
        el.classList.add("open");
        el.textContent = lang === "hi" ? "अभी खुली है" : "Open now";
        return;
      }
      el.classList.add("closed");
      if (now.minutes < today[0]) {
        el.textContent = (lang === "hi" ? "खुलेगी " : "Opens at ") + formatTime(today[0], lang);
      } else {
        var tomorrow = rangeFor(store, (now.weekday + 1) % 7);
        el.textContent = (lang === "hi" ? "कल खुलेगी " : "Opens tomorrow at ") + formatTime(tomorrow[0], lang);
      }
    });
  }

  applyLang(readStoredLang() || currentLang());
})();
