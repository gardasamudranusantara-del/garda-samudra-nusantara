"use client";

import { useEffect, useState } from "react";

const contactWhatsappUrl =
  "https://wa.me/6285190907967?text=Hello%20Garda%20Samudra%20Nusantara%2C%20I%20would%20like%20to%20contact%20your%20team.";

const labels = {
  en: {
    home: "Home",
    about: "About",
    products: "Products",
    projects: "Projects",
    partnership: "Partnership",
    inquiry: "Inquiry Form",
    contact: "Contact",
    contactUs: "Contact Us"
  },
  id: {
    home: "Beranda",
    about: "Tentang",
    products: "Produk",
    projects: "Proyek",
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
        <a className="nav-action" href={contactWhatsappUrl} target="_blank" rel="noreferrer">
          {text.contactUs}
        </a>
      </div>
    </header>
  );
}
