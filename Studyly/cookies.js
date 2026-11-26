/* Studyly cookie consent: stores the user's choice in a first-party cookie.
   This project currently sets no analytics or advertising cookies. */
(function () {
  "use strict";
  const COOKIE_NAME = "studyly_cookie_consent";
  const banner = document.getElementById("cookieConsent");
  const accept = document.getElementById("acceptCookiesBtn");
  const essential = document.getElementById("essentialCookiesBtn");

  function readCookie(name) {
    const prefix = name + "=";
    const item = document.cookie.split("; ").find(part => part.startsWith(prefix));
    if (!item) return null;
    try { return JSON.parse(decodeURIComponent(item.slice(prefix.length))); }
    catch (_) { return null; }
  }

  function saveChoice(choice) {
    const value = {
      necessary: true,
      preferences: choice === "all",
      analytics: false,
      marketing: false,
      choice: choice,
      savedAt: new Date().toISOString()
    };
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(value)) +
      "; Max-Age=" + (60 * 60 * 24 * 180) + "; Path=/; SameSite=Lax" + secure;
    if (banner) banner.classList.add("hidden");
    window.dispatchEvent(new CustomEvent("studyly:cookie-consent", { detail: value }));
  }

  function init() {
    if (!banner) return;
    const existing = readCookie(COOKIE_NAME);
    if (!existing) banner.classList.remove("hidden");
    if (accept) accept.addEventListener("click", () => saveChoice("all"));
    if (essential) essential.addEventListener("click", () => saveChoice("essential"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Expose a small, read-only consent lookup for future optional features.
  window.StudylyCookieConsent = Object.freeze({
    get: () => readCookie(COOKIE_NAME)
  });
})();