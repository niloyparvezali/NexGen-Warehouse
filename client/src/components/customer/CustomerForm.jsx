import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { normalizePhoneInput, isValidPhoneNumber } from "../../utils/phone";

const CustomerForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [customerType, setCustomerType] = useState(initialData.customerType || "RETAIL");
  const [previousDue, setPreviousDue] = useState(initialData.previousDue || initialData.openingDue || 0);
  const [currentBalance, setCurrentBalance] = useState(initialData.currentBalance || 0);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [status, setStatus] = useState(initialData.status || "ACTIVE");
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Customer name is required.");
    if (!phone.trim()) return setError("Mobile number is required.");
    const cleanPhone = normalizePhoneInput(phone);
    if (!isValidPhoneNumber(cleanPhone)) return setError("Mobile number must be exactly 11 digits.");
    setError("");
    onSubmit({ name: name.trim(), phone: cleanPhone, email: email.trim(), address: address.trim(), city: city.trim(), customerType, previousDue: Number(previousDue || 0), currentBalance: Number(currentBalance || 0), notes: notes.trim(), status });
  };

  return <form onSubmit={handleSubmit} className="wc-form">
    {error && <p className="wc-form-error">{error}</p>}
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Customer identity</h3><p className="wc-form-section__hint">The details staff will use at checkout and during customer follow-up.</p></div></div>
      <div className="wc-form-grid wc-form-grid--2">
        <Input label="Customer name" placeholder="Full name" value={name} autoFocus onChange={(e)=>{setName(e.target.value); if(error)setError("")}} />
        <Input label="Mobile number" placeholder="11-digit mobile number" value={phone} maxLength={11} onChange={(e)=>setPhone(normalizePhoneInput(e.target.value))}/>
        <Input label="Email" placeholder="name@example.com" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <Input label="City" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)}/>
      </div>
      <div className="mt-4"><Input label="Address" placeholder="Street, area or delivery address" value={address} onChange={(e)=>setAddress(e.target.value)}/></div>
    </section>
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Account setup</h3><p className="wc-form-section__hint">Choose how this customer is treated in sales and account balances.</p></div></div>
      <div className="wc-form-grid wc-form-grid--2">
        <div><label>Customer type</label><select value={customerType} onChange={(e)=>setCustomerType(e.target.value)}><option value="RETAIL">Retail</option><option value="WHOLESALE">Wholesale</option></select></div>
        <div><label>Status</label><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
        <Input label="Opening due" type="number" min="0" value={previousDue} onChange={(e)=>setPreviousDue(e.target.value)}/>
        <Input label="Current balance" type="number" min="0" value={currentBalance} onChange={(e)=>setCurrentBalance(e.target.value)}/>
      </div>
    </section>
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Notes</h3><p className="wc-form-section__hint">Optional internal notes for this customer.</p></div></div><textarea rows={4} placeholder="Add notes, preferences or delivery instructions…" value={notes} onChange={(e)=>setNotes(e.target.value)}/></section>
    <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update customer" : "Save customer")}</Button></div>
  </form>;
};
export default CustomerForm;
