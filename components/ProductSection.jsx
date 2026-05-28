export default function ProductSection({ products }) {
  return (
    <section className="section products-section" id="products" aria-labelledby="products-title">
      <div className="section-heading compact">
        <p className="eyebrow">Featured Products</p>
        <h2 id="products-title">Quality commodities for national and international market needs.</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.name}>
            <img src={product.image} alt={product.imageAlt} />
            <div>
              <span>{product.division}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
