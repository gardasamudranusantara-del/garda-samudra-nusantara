"use client";

import { useEffect, useState } from "react";

const contactWhatsappUrl =
  "https://wa.me/6285190907967?text=Hello%20Garda%20Samudra%20Nusantara%2C%20I%20would%20like%20to%20contact%20your%20team.";

const labels = {
  en: {
    home: "Home",
    about: "About",
    products: "Products",
    projects: "Buyer Info",
    partnership: "Partnership",
    inquiry: "Inquiry Form",
    contact: "Contact",
    contactUs: "Contact Us"
  },
  id: {
    home: "Beranda",
    about: "Tentang",
    products: "Produk",
    projects: "Info Buyer",
    partnership: "Kemitraan",
    inquiry: "Form Inquiry",
    contact: "Kontak",
    contactUs: "Hubungi Kami"
  }
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("gsn-language");
    if (savedLanguage === "id" || savedLanguage === "en") {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage === "id" ? "id" : "en";
    }
  }, []);

  function toggleLanguage() {
    const nextLanguage = language === "en" ? "id" : "en";
    setLanguage(nextLanguage);
    window.localStorage.setItem("gsn-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "id" ? "id" : "en";
    window.dispatchEvent(new CustomEvent("gsn:language", { detail: nextLanguage }));
  }

  const text = labels[language];

  return (
    <header className={`navbar future-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <a className="brand" href="#home" aria-label="Garda Samudra Nusantara home">
        <span>
          <img src="/logos/gsn-clear-logo.png" alt="" aria-hidden="true" />
        </span>
        <strong>GSN</strong>
      </a>

      <nav aria-label="Main navigation">
        <a href="#home">{text.home}</a>
        <a href="#about">{text.about}</a>
        <a href="#products">{text.products}</a>
        <a href="#projects">{text.projects}</a>
        <a href="#partnership">{text.partnership}</a>
        <a href="#gsnformneo">{text.inquiry}</a>
        <a href="#contact">{text.contact}</a>
      </nav>

      <div className="nav-control-group">
        <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label="Toggle language">
          {language === "en" ? "ID" : "EN"}
        </button>
        <a className="nav-action" href={contactWhatsappUrl} target="_blank" rel="noreferrer" aria-label={text.contactUs}>
          <span aria-hidden="true" className="nav-action-icon">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12.03 3.25a8.54 8.54 0 0 0-7.27 13.03l-.9 3.39 3.48-.88a8.54 8.54 0 1 0 4.69-15.54Zm0 1.55a6.99 6.99 0 0 1 5.91 10.72 6.99 6.99 0 0 1-9.88 2.11l-.26-.16-1.74.44.45-1.68-.18-.28a6.99 6.99 0 0 1 5.7-11.15Zm-2.4 3.67c-.15 0-.39.05-.59.28-.2.23-.78.76-.78 1.86s.8 2.16.92 2.31c.11.15 1.56 2.48 3.86 3.38 1.91.75 2.31.6 2.73.56.42-.04 1.35-.55 1.54-1.08.19-.53.19-.99.13-1.08-.06-.09-.21-.15-.44-.27-.23-.12-1.35-.67-1.56-.74-.21-.08-.36-.12-.51.11-.15.23-.59.74-.72.89-.13.15-.27.17-.5.06-.23-.12-.97-.36-1.85-1.14-.68-.61-1.14-1.36-1.28-1.59-.13-.23-.01-.36.1-.47.1-.1.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.12-.51-1.24-.7-1.7-.18-.45-.37-.39-.51-.4h-.43Z" />
            </svg>
          </span>
          {text.contactUs}
        </a>
      </div>
    </header>
  );
}
