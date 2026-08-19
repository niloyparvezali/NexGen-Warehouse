import { useMemo, useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const paymentMethods = ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_BANKING"];

const PaymentForm = ({ initialData = {}, onSubmit, loading = false, isCustomer = true }) => {
  const [saleOrPurchaseId, setSaleOrPurchaseId] = useState(initialData.saleOrPurchaseId || "");
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || "CASH");
  const [reference, setReference] = useState(initialData.reference || "");
  const [amount, setAmount] = useState(initialData.amount || 0);
  const [note, setNote] = useState(initialData.note || "");
  const [error, setError] = useState("");

  const initialValues = useMemo(() => ({
    saleOrPurchaseId: initialData.saleOrPurchaseId || "",
    paymentMethod: initialData.paymentMethod || "CASH",
    reference: initialData.reference || "",
    amount: initialData.amount || 0,
    note: initialData.note || "",
  }), [initialData.saleOrPurchaseId, initialData.paymentMethod, initialData.reference, initialData.amount, initialData.note]);

  const resetForm = () => {
    setSaleOrPurchaseId(initialValues.saleOrPurchaseId);
    setPaymentMethod(initialValues.paymentMethod);
    setReference(initialValues.reference);
    setAmount(initialValues.amount);
    setNote(initialValues.note);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!saleOrPurchaseId) {
      setError(isCustomer ? "Sale ID is required." : "Purchase ID is required.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setError("");

    onSubmit({
      [isCustomer ? "saleId" : "purchaseId"]: saleOrPurchaseId,
      amount: Number(amount),
      paymentMethod,
      reference: reference.trim(),
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wc-form">
      <div className="flex justify-end"><button type="button" onClick={resetForm} className="wc-quiet-button">Reset</button></div>
      {error && <p className="wc-form-error">{error}</p>}
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Payment information</h3><p className="wc-form-section__hint">Link the payment to the correct sale or purchase, then record the amount and method.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2"><Input label={isCustomer?"Sale ID":"Purchase ID"} placeholder={isCustomer?"Enter sale ID":"Enter purchase ID"} value={saleOrPurchaseId} onChange={(e)=>setSaleOrPurchaseId(e.target.value)} autoFocus/><Input label="Amount" type="number" min="0" value={amount} onChange={(e)=>setAmount(e.target.value)}/><div><label>Payment method</label><select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>{paymentMethods.map((method)=><option key={method} value={method}>{method.replace("_"," ")}</option>)}</select></div><Input label="Reference" placeholder="Transaction/reference number" value={reference} onChange={(e)=>setReference(e.target.value)}/></div>
      </section>
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Notes</h3><p className="wc-form-section__hint">Optional context for the payment record.</p></div></div><textarea rows={4} placeholder="Add payment notes…" value={note} onChange={(e)=>setNote(e.target.value)}/></section>
      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading?"Submitting…":"Submit payment"}</Button></div>
    </form>
  );

};

export default PaymentForm;
