import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/products").then((res) => setProducts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCategory === "All" || product.category?.toLowerCase() === selectedCategory.toLowerCase())
  ), [products, search, selectedCategory]);

  const features = [
    ["truck", "Fast Delivery", "Quick delivery of your study essentials."],
    ["book", "Quality Products", "Reliable books, stationery and accessories."],
    ["shield", "Secure Shopping", "A safe and trusted shopping experience."],
    ["money", "Student Pricing", "Affordable products selected for students."]
  ];

  return <main>
    <section className="hero-section">
      <div className="hero-content">
        <span className="eyebrow">Everything students need</span>
        <h1>Study smarter with better essentials.</h1>
        <p>Discover stationery, books and everyday accessories selected to keep college life simple and productive.</p>
        <div className="hero-actions">
          <button className="btn btn-light" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>Browse Products</button>
          <span className="hero-note"><Icon name="shield" />Secure and student-friendly</span>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-card hero-card-main"><Icon name="book" size={56}/><strong>Learn. Create. Achieve.</strong><span>All essentials in one place</span></div><div className="floating-badge badge-one"><Icon name="truck" />Fast delivery</div><div className="floating-badge badge-two"><Icon name="star" />Top quality</div></div>
    </section>

    <section className="featured-section section-shell">
      <div className="section-heading"><div><span className="eyebrow">Popular picks</span><h2>Featured Products</h2></div></div>
      <div className="featured-grid">{products.slice(0, 4).map((product) => <ProductCard key={product._id} product={product}/>)}</div>
    </section>

    <section className="why-section section-shell">
      <div className="section-heading centered"><span className="eyebrow">Built for students</span><h2>Why choose StudyStore?</h2><p>Simple shopping, dependable products and fair prices.</p></div>
      <div className="why-grid">{features.map(([icon, title, text]) => <article className="why-card" key={title}><span className="feature-icon"><Icon name={icon} size={26}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section id="products" className="products-section section-shell">
      <div className="section-heading products-heading"><div><span className="eyebrow">Explore the collection</span><h2>All Products</h2></div><div className="search-wrap"><Icon name="search"/><input className="search-box" type="search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)}/></div></div>
      <div className="category-container">{["All", "Stationery", "Books", "Accessories"].map((category) => <button key={category} className={selectedCategory === category ? "active-category" : ""} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
      <div className="products-container">{loading ? [...Array(8)].map((_, index) => <div className="skeleton-card" key={index}><div className="skeleton-image"/><div className="skeleton-text"/><div className="skeleton-text short"/></div>) : filteredProducts.length ? filteredProducts.map((product) => <ProductCard key={product._id} product={product}/>) : <div className="empty-state"><Icon name="search" size={34}/><h3>No products found</h3><p>Try another search or category.</p></div>}</div>
    </section>

    <section className="testimonial-section section-shell">
      <div className="section-heading centered"><span className="eyebrow">Student reviews</span><h2>What students say</h2></div>
      <div className="testimonial-grid">{[["Rahul Patel","StudyStore has everything I need for college. Delivery was fast and pricing was fair."],["Priya Shah","The quality of books and stationery is excellent. The experience feels simple and reliable."],["Aman Kumar","A clean website with useful products and a smooth shopping experience."]].map(([name, quote]) => <article className="testimonial-card" key={name}><div className="testimonial-top"><div className="avatar">{name[0]}</div><div><h3>{name}</h3><div className="stars" aria-label="5 stars">{[1,2,3,4,5].map(i => <Icon name="star" size={16} key={i}/>)}</div></div></div><p>“{quote}”</p></article>)}</div>
    </section>
  </main>;
}
export default Home;
