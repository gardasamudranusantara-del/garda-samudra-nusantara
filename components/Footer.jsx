export default function Footer({ contacts = [], description = "Trading, distribution, and development of Indonesia's leading commodities.", values = [] }) {
  return (
    <footer className="footer">
      <div>
        <strong>Garda Samudra Nusantara</strong>
        <p>{description}</p>
        <ul>
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </div>
      <div className="footer-links">
        {contacts.slice(1).map((contact) => (
          <a
            href={contact.href}
            key={contact.label}
            rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
            target={contact.href.startsWith("http") ? "_blank" : undefined}
          >
            {contact.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
