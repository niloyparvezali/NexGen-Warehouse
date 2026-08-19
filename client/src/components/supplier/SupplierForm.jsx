import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { normalizePhoneInput, isValidPhoneNumber } from "../../utils/phone";

const SupplierForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const [supplierName, setSupplierName] = useState(initialData.supplierName || "");
  const [companyName, setCompanyName] = useState(initialData.companyName || "");
  const [contactPerson, setContactPerson] = useState(initialData.contactPerson || "");
  const [mobileNumber, setMobileNumber] = useState(initialData.mobileNumber || initialData.phone || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [taxNumber, setTaxNumber] = useState(initialData.taxNumber || "");
  const [previousDue, setPreviousDue] = useState(initialData.previousDue || 0);
  const [currentBalance, setCurrentBalance] = useState(initialData.currentBalance || 0);
  const [status, setStatus] = useState(initialData.status || "ACTIVE");
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData?.id);
  const handleSubmit=(e)=>{e.preventDefault(); if(!supplierName.trim())return setError("Supplier name is required."); const cleanPhone=normalizePhoneInput(mobileNumber); if(mobileNumber.trim()&&!isValidPhoneNumber(cleanPhone))return setError("Mobile number must be exactly 11 digits."); setError(""); onSubmit({supplierName:supplierName.trim(),companyName:companyName.trim(),contactPerson:contactPerson.trim(),mobileNumber:cleanPhone,email:email.trim(),address:address.trim(),city:city.trim(),country:country.trim(),taxNumber:taxNumber.trim(),previousDue:Number(previousDue||0),currentBalance:Number(currentBalance||0),status});};
  return <form onSubmit={handleSubmit} className="wc-form">
    {error&&<p className="wc-form-error">{error}</p>}
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Supplier identity</h3><p className="wc-form-section__hint">Keep the legal/business identity and main contact details together.</p></div></div><div className="wc-form-grid wc-form-grid--2"><Input label="Supplier name" placeholder="Supplier name" value={supplierName} autoFocus onChange={(e)=>{setSupplierName(e.target.value);if(error)setError("")}}/><Input label="Company name" placeholder="Company or trading name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)}/><Input label="Contact person" placeholder="Primary contact" value={contactPerson} onChange={(e)=>setContactPerson(e.target.value)}/><Input label="Mobile number" placeholder="11-digit mobile number" value={mobileNumber} maxLength={11} onChange={(e)=>setMobileNumber(normalizePhoneInput(e.target.value))}/><Input label="Email" placeholder="name@company.com" value={email} onChange={(e)=>setEmail(e.target.value)}/><Input label="Tax / VAT number" placeholder="Optional tax number" value={taxNumber} onChange={(e)=>setTaxNumber(e.target.value)}/></div></section>
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Address</h3><p className="wc-form-section__hint">Where this supplier operates or where documents should be sent.</p></div></div><div className="wc-form-grid wc-form-grid--2"><Input label="City" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)}/><Input label="Country" placeholder="Country" value={country} onChange={(e)=>setCountry(e.target.value)}/></div><div className="mt-4"><Input label="Address" placeholder="Street, area or office address" value={address} onChange={(e)=>setAddress(e.target.value)}/></div></section>
    <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Account status</h3><p className="wc-form-section__hint">Opening and current balances are shown here for financial context.</p></div></div><div className="wc-form-grid wc-form-grid--3"><Input label="Opening due" type="number" min="0" value={previousDue} onChange={(e)=>setPreviousDue(e.target.value)}/><Input label="Current balance" type="number" min="0" value={currentBalance} onChange={(e)=>setCurrentBalance(e.target.value)}/><div><label>Status</label><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div></div></section>
    <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading?(isEdit?"Updating…":"Saving…"):(isEdit?"Update supplier":"Save supplier")}</Button></div>
  </form>;
};
export default SupplierForm;
