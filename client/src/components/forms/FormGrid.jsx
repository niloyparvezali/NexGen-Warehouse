import { cn } from "../../utils/cn";

/**
 * FormGrid - Responsive grid for form fields
 * Supports 1, 2, 3, 4+ column layouts
 * Automatically collapses to 1 column on mobile
 */
const FormGrid = ({ columns = 2, children, className = "" }) => {
  const colsClass = {
    1: "form-grid--1",
    2: "form-grid--2",
    3: "form-grid--3",
    4: "form-grid--4",
  }[columns] || "form-grid--2";

  return (
    <div className={cn("form-grid", colsClass, className)}>
      {children}
    </div>
  );
};

export default FormGrid;
