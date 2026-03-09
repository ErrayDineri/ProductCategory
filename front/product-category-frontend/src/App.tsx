import './App.css';
import ProductList from "./components/ProductList";
import CategoryList from "./components/CategoryList";
import { useState } from "react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleDataChanged() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <>
      <div className="app-header">
        <h1>Product Catalog</h1>
        <p>Browse products and categories</p>
      </div>

      <div className="section">
        <ProductList refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      </div>

      <div className="section">
        <CategoryList refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      </div>
    </>
  );
}