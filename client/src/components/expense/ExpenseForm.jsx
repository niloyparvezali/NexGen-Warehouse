import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import { getExpenseCategories } from "../../services/expenseCategory.service";

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_BANKING", label: "Mobile Banking" },
];

const ExpenseForm = ({
  initialData = {
    id: null,
    expenseCategoryId: "",
    description: "",
    amount: "",
    expenseDate: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    attachment: "",
    note: "",
  },
  onSubmit,
  loading = false,
}) => {
  const [expenseCategoryId, setExpenseCategoryId] = useState(initialData.expenseCategoryId || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [amount, setAmount] = useState(initialData.amount || "");
  const [expenseDate, setExpenseDate] = useState(initialData.expenseDate ? new Date(initialData.expenseDate).toISOString().slice(0, 10) : "");
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || "CASH");
  const [referenceNumber, setReferenceNumber] = useState(initialData.referenceNumber || "");
  const [attachment, setAttachment] = useState(initialData.attachment || "");
  const [note, setNote] = useState(initialData.note || "");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const isEdit = Boolean(initialData?.id);
  const formKey = initialData?.id ?? "new";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getExpenseCategories(1, 100, "");
        setCategories(response?.categories ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!expenseCategoryId) {
      setError("Expense category is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!expenseDate) {
      setError("Expense date is required.");
      return;
    }

    setError("");

    onSubmit({
      expenseCategoryId,
      description: description.trim(),
      amount: Number(amount),
      expenseDate,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      attachment: attachment.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Expense details</h3><p className="wc-form-section__hint">Record what was spent, when it happened and how it was paid.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2">
          <div><label>Expense category</label><select value={expenseCategoryId} onChange={(e)=>setExpenseCategoryId(e.target.value)}><option value="">Select category</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <Input label="Expense date" type="date" value={expenseDate} onChange={(e)=>setExpenseDate(e.target.value)} />
          <Input label="Amount" type="number" min="0" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} />
          <div><label>Payment method</label><select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>{paymentMethods.map((method)=><option key={method.value} value={method.value}>{method.label}</option>)}</select></div>
        </div>
      </section>
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Reference & notes</h3><p className="wc-form-section__hint">Add supporting information so the transaction is easy to audit later.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2"><Input label="Reference number" placeholder="Optional invoice or receipt reference" value={referenceNumber} onChange={(e)=>setReferenceNumber(e.target.value)}/><Input label="Attachment" placeholder="Optional attachment URL or file reference" value={attachment} onChange={(e)=>setAttachment(e.target.value)}/></div>
        <div className="wc-form-grid wc-form-grid--2 mt-4"><div><label>Description</label><textarea rows={4} placeholder="What was this expense for?" value={description} onChange={(e)=>setDescription(e.target.value)}/></div><div><label>Internal note</label><textarea rows={4} placeholder="Optional internal note" value={note} onChange={(e)=>setNote(e.target.value)}/></div></div>
      </section>
      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading?(isEdit?"Updating…":"Saving…"):(isEdit?"Update expense":"Save expense")}</Button></div>
    </form>
  );

};

export default ExpenseForm;
