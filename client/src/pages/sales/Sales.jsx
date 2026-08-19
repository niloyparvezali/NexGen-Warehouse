import { useState } from "react";
import { Clock3, ShoppingCart } from "lucide-react";

import Pos from "../../components/sales/Pos";
import SalesHistory from "../../components/sales/SalesHistory";

const Sales = () => {
  const [tab, setTab] = useState("pos");

  return (
    <div className={`page-container page-standard sales-page ${tab === "pos" ? "sales-page--pos" : ""}`}>
      <header className="sales-page-header">
        <div>
          <span className="sales-page-kicker">POS / Sales workspace</span>
          <h1 className="page-title">POS / Sales</h1>
          <p>Sell products quickly, keep customer details organized, and finish every transaction with confidence.</p>
        </div>
        <div className="sales-view-switch" role="tablist" aria-label="Sales views">
          <button type="button" role="tab" aria-selected={tab === "pos"} className={tab === "pos" ? "active" : ""} onClick={() => setTab("pos")}><ShoppingCart size={16} /> New sale</button>
          <button type="button" role="tab" aria-selected={tab === "history"} className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><Clock3 size={16} /> History</button>
        </div>
      </header>
      {tab === "pos" ? <Pos /> : <div className="sales-history-shell"><SalesHistory /></div>}
    </div>
  );
};

export default Sales;
