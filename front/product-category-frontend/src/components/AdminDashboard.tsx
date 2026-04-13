import { useState } from "react";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import SupplierList from "./SupplierList";

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleDataChanged() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <>
      <div className="section">
        <ProductList refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      </div>

      <div className="section">
        <CategoryList refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      </div>

      <div className="section">
        <SupplierList refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      </div>
    </>
  );
}
