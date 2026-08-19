import { useState } from "react";

import Button from "../../components/ui/Button";
import SalesReturn from "../../components/sales/SalesReturn";
import ReturnProductList from "../../components/sales/ReturnProductList";

const EasyReturn = () => {
  const [activeTab, setActiveTab] = useState("return");

  return (
    <div className="wc-page world-module world-returns space-y-5 page-container page-standard easy-return-page">
      <div>
        <h1 className="page-title">Easy Return</h1>
      </div>

      <div className="return-tabs">
        <Button size="sm" variant={activeTab === "return" ? "secondary" : "ghost"} onClick={() => setActiveTab("return")}>
          Return
        </Button>
        <Button size="sm" variant={activeTab === "list" ? "secondary" : "ghost"} onClick={() => setActiveTab("list")}>
          Return Product List
        </Button>
      </div>

      <div className="return-section">{activeTab === "return" ? <SalesReturn /> : <ReturnProductList />}</div>
    </div>
  );
};

export default EasyReturn;
