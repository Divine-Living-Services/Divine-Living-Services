/* Divine Living Services — Accessibility Toolbar
   Provides: text size control, high-contrast mode, dyslexia-friendly font.
   Preferences persist across pages using localStorage. */

(function () {
  "use strict";

  var STORAGE_KEY = "dls-a11y-prefs";

  function loadPrefs() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { textSize: "base", contrast: false, dyslexia: false };
    } catch (e) {
      return { textSize: "base", contrast: false, dyslexia: false };
    }
  }

  function savePrefs(prefs) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      /* localStorage unavailable — preferences just won't persist */
    }
  }

  function applyPrefs(prefs) {
    var html = document.documentElement;
    html.classList.remove("text-lg", "text-xl");
    if (prefs.textSize === "lg") html.classList.add("text-lg");
    if (prefs.textSize === "xl") html.classList.add("text-xl");
    html.classList.toggle("high-contrast", !!prefs.contrast);
    html.classList.toggle("dyslexia-font", !!prefs.dyslexia);
  }

  var prefs = loadPrefs();
  applyPrefs(prefs);

  document.addEventListener("DOMContentLoaded", function () {
    var toolbar = document.createElement("div");
    toolbar.className = "a11y-toolbar";
    toolbar.innerHTML =
      '<button type="button" class="a11y-toggle" id="a11yToggle" aria-expanded="false" aria-controls="a11yPanel" aria-label="Open accessibility settings">' +
        '<span aria-hidden="true">&#9855;</span>' +
      "</button>" +
      '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="Accessibility settings">' +
        "<h2>Accessibility Settings</h2>" +
        '<div class="a11y-row">' +
          "<span>Text size</span>" +
          '<div class="a11y-btn-group" role="group" aria-label="Text size">' +
            '<button type="button" data-size="base" aria-pressed="false">A</button>' +
            '<button type="button" data-size="lg" aria-pressed="false">A+</button>' +
            '<button type="button" data-size="xl" aria-pressed="false">A++</button>' +
          "</div>" +
        "</div>" +
        '<div class="a11y-row">' +
          "<span>High contrast</span>" +
          '<div class="a11y-btn-group" role="group" aria-label="High contrast mode">' +
            '<button type="button" data-contrast="on" aria-pressed="false">On</button>' +
            '<button type="button" data-contrast="off" aria-pressed="false">Off</button>' +
          "</div>" +
        "</div>" +
        '<div class="a11y-row">' +
          "<span>Dyslexia-friendly font</span>" +
          '<div class="a11y-btn-group" role="group" aria-label="Dyslexia-friendly font">' +
            '<button type="button" data-dyslexia="on" aria-pressed="false">On</button>' +
            '<button type="button" data-dyslexia="off" aria-pressed="false">Off</button>' +
          "</div>" +
        "</div>" +
        '<button type="button" class="a11y-reset" id="a11yReset">Reset to default</button>' +
      "</div>";
    document.body.appendChild(toolbar);

    var panel = document.getElementById("a11yPanel");
    var toggleBtn = document.getElementById("a11yToggle");

    function syncButtonStates() {
      toolbar.querySelectorAll("[data-size]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.dataset.size === prefs.textSize));
      });
      toolbar.querySelectorAll("[data-contrast]").forEach(function (btn) {
        var isOn = btn.dataset.contrast === "on";
        btn.setAttribute("aria-pressed", String(isOn === !!prefs.contrast));
      });
      toolbar.querySelectorAll("[data-dyslexia]").forEach(function (btn) {
        var isOn = btn.dataset.dyslexia === "on";
        btn.setAttribute("aria-pressed", String(isOn === !!prefs.dyslexia));
      });
    }
    syncButtonStates();

    toggleBtn.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (e) {
      if (!toolbar.contains(e.target)) {
        panel.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        panel.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.focus();
      }
    });

    toolbar.querySelectorAll("[data-size]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        prefs.textSize = btn.dataset.size;
        applyPrefs(prefs);
        savePrefs(prefs);
        syncButtonStates();
      });
    });
    toolbar.querySelectorAll("[data-contrast]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        prefs.contrast = btn.dataset.contrast === "on";
        applyPrefs(prefs);
        savePrefs(prefs);
        syncButtonStates();
      });
    });
    toolbar.querySelectorAll("[data-dyslexia]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        prefs.dyslexia = btn.dataset.dyslexia === "on";
        applyPrefs(prefs);
        savePrefs(prefs);
        syncButtonStates();
      });
    });

    document.getElementById("a11yReset").addEventListener("click", function () {
      prefs = { textSize: "base", contrast: false, dyslexia: false };
      applyPrefs(prefs);
      savePrefs(prefs);
      syncButtonStates();
    });
  });
})();
