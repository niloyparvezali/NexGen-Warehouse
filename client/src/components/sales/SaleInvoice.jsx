import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSettings } from "../../services/settings.service";
import { formatMoney } from "../../utils/formatters";
import "./SaleInvoice.css";

const COMPANY_FALLBACK = {
  address:
    "Dalay Factory Mor, 10 No Ward, Ambag, Konabari, Gazipur City, Bangladesh",
  phone: "+880 1580-846596",
  email: "nexgentechnology2025@gmail.com",
  facebook: "NexGen Technology",
  logo: "/logo/ng-icon.png",
  textLogo: "/logo/ng-text.png",
};

const formatAmount = (value) => {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "0";
  }

  return formatMoney(amount, { locale: "en-BD" });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getCustomerDisplay = (customer) => {
  if (!customer) return "Walk-in Customer";

  if (!customer.name && !customer.phone && !customer.address) {
    return "Walk-in Customer";
  }

  return customer.name || "Walk-in Customer";
};

/*
 * Warranty conversion:
 *
 * 1 Year   = 365 Days
 * 2 Years  = 730 Days
 * 6 Months = 180 Days
 * 3 Months = 90 Days
 *
 * If the existing database already stores a numeric warranty,
 * that number is used directly.
 */
const parseWarrantyToDays = (value) => {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  const normalized = String(value).trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  const quantity = Number(match[1]);

  if (Number.isNaN(quantity)) {
    return null;
  }

  if (/year|yr/.test(normalized)) {
    return Math.round(quantity * 365);
  }

  if (/month|mo/.test(normalized)) {
    return Math.round(quantity * 30);
  }

  if (/week|wk/.test(normalized)) {
    return Math.round(quantity * 7);
  }

  if (/day|days/.test(normalized)) {
    return Math.round(quantity);
  }

  return Math.round(quantity);
};

const parseSerials = (value) => {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      // Continue with normal string parsing.
    }

    return text
      .split(/[\r\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
};

const amountToWords = (value) => {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "Zero Only.";
  }

  const integer = Math.floor(Math.abs(amount));

  if (integer === 0) {
    return "Zero Only.";
  }

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const scales = ["", "Thousand", "Million", "Billion"];

  const chunk = (n) => {
    const words = [];

    if (n >= 100) {
      words.push(units[Math.floor(n / 100)], "Hundred");
      n %= 100;
    }

    if (n >= 20) {
      words.push(tens[Math.floor(n / 10)]);
      n %= 10;
    }

    if (n > 0) {
      words.push(units[n]);
    }

    return words.join(" ");
  };

  const parts = [];
  let remaining = integer;
  let scaleIndex = 0;

  while (remaining > 0) {
    const current = remaining % 1000;

    if (current) {
      const chunkWords = chunk(current);

      parts.unshift(
        `${chunkWords}${
          scales[scaleIndex] ? ` ${scales[scaleIndex]}` : ""
        }`.trim(),
      );
    }

    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return `${parts.join(" ")} Only.`;
};

const paymentMethodLabel = (method) => {
  if (!method) {
    return "N/A";
  }

  const map = {
    CASH: "Cash",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    MOBILE_BANKING: "Mobile Banking",
    BKASH: "bKash",
    NAGAD: "Nagad",
    ROCKET: "Rocket",
    UPAY: "Upay",
  };

  return map[method] || method;
};

/*
 * Try several common existing sale fields for Sales Person.
 * We do not modify or create any database field.
 */
const getSalesPerson = (sale) => {
  if (sale?.createdBy) {
    const firstName = sale.createdBy.first_name || "";
    const lastName = sale.createdBy.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (sale.createdBy.name && typeof sale.createdBy.name === "string") {
      return sale.createdBy.name;
    }

    if (typeof sale.createdBy === "string") {
      return sale.createdBy;
    }
  }

  const fallback =
    sale?.salesPerson?.name ||
    sale?.seller?.name ||
    sale?.user?.name ||
    (typeof sale?.salesPerson === "string" ? sale.salesPerson : null) ||
    (typeof sale?.seller === "string" ? sale.seller : null) ||
    (typeof sale?.user === "string" ? sale.user : null);

  return fallback || "—";
};

const SaleInvoice = ({ sale, onReadyToPrint }) => {
  const [company, setCompany] = useState(null);
  const hasPrintReadyRun = useRef(false);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const settings = await getSettings();

        if (active) {
          setCompany(settings);
        }
      } catch (err) {
        console.error("Failed to load company settings", err);
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!onReadyToPrint || !sale || !company) {
      return;
    }

    if (hasPrintReadyRun.current) {
      return;
    }

    hasPrintReadyRun.current = true;
    const timer = window.setTimeout(() => {
      onReadyToPrint();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sale, company, onReadyToPrint]);

  const payments = useMemo(() => sale?.payments || [], [sale]);

  const paymentMethods = useMemo(() => {
    const methods = new Set();

    payments.forEach((payment) => {
      if (payment.paymentMethod) {
        methods.add(payment.paymentMethod);
      }
    });

    return [...methods];
  }, [payments]);

  const paymentMethodDisplay = sale?.paymentMethod
    ? paymentMethodLabel(sale.paymentMethod)
    : paymentMethods.map(paymentMethodLabel).join(", ") || "N/A";

  const companySettings = {
    address: company?.company_address?.trim() || COMPANY_FALLBACK.address,

    phone: company?.company_phone?.trim() || COMPANY_FALLBACK.phone,

    email: company?.company_email?.trim() || COMPANY_FALLBACK.email,

    facebook: company?.company_facebook?.trim() || COMPANY_FALLBACK.facebook,

    logo: company?.company_logo?.trim() || COMPANY_FALLBACK.logo,

    textLogo: company?.company_text_logo?.trim() || COMPANY_FALLBACK.textLogo,
  };

  const {
    address: companyAddress,
    phone: companyPhone,
    email: companyEmail,
    facebook: companyFacebook,
    logo: companyLogo,
    textLogo: companyTextLogo,
  } = companySettings;

  const companyPhoneNumbers = [
    companyPhone,
    "+880 1793-119822",
    "+880 1937-526295",
  ].filter((phone, index, list) => Boolean(phone) && list.indexOf(phone) === index);

  const saleDate = formatDate(sale?.createdAt);
  const saleTime = formatTime(sale?.createdAt);

  const customerName = getCustomerDisplay(sale?.customer);

  const customerPhone = sale?.customer?.phone || "N/A";

  const customerAddress = sale?.customer?.address || "N/A";

  const salesPerson = getSalesPerson(sale);

  const amountWords = amountToWords(sale?.total);

  const serialsForItem = (item) => {
    return parseSerials(
      item.serialNumbers ||
        item.serial ||
        item.serialNumber ||
        item.serials ||
        item.product?.serial,
    );
  };

  const warrantyForItem = (item) => {
    return parseWarrantyToDays(
      item.warranty ?? item.warrantyDays ?? item.product?.warranty,
    );
  };

  return (
    <div className="invoice-preview-shell">
      <div className="invoice-preview-stage">
        <div className="invoice-print-root">
          <div className="invoice-print-sheet">
        {/* ============================================================
          HEADER
      ============================================================ */}

        <div className="invoice-header">
          {/* LEFT — LOGO + TEXT LOGO */}

          <div className="invoice-brand-block">
            {companyLogo ? (
              <img
                src="/logo/ng-icon-black.png"
                alt="NEXGEN Logo"
                className="invoice-logo"
              />
            ) : (
              <div className="invoice-logo-placeholder">NG</div>
            )}

            {companyTextLogo ? (
              <img
                src="/logo/ng-text-black.png"
                alt="NEXGEN TECHNOLOGY"
                className="invoice-left-text-logo"
              />
            ) : null}
          </div>

          {/* RIGHT — COMPANY INFORMATION */}

          <div className="invoice-company-block">
            <div className="invoice-company-name">NEXGEN TECHNOLOGY</div>

            <div className="invoice-contact-list">
              <div className="invoice-contact-column">
                {companyAddress ? (
                  <div className="invoice-contact-item">
                    <span className="invoice-contact-icon" aria-hidden="true">
                      <MapPin />
                    </span>

                    <div>
                      <strong>Address:</strong>
                      <span>{companyAddress}</span>
                    </div>
                  </div>
                ) : null}

                {companyPhoneNumbers.length > 0 ? (
                  <div className="invoice-contact-item">
                    <span className="invoice-contact-icon" aria-hidden="true">
                      <Phone />
                    </span>

                    <div>
                      <strong>Phone:</strong>
                      <div className="invoice-phone-list">
                        {companyPhoneNumbers.map((phoneNumber) => (
                          <span key={phoneNumber} className="invoice-phone-item">
                            {phoneNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="invoice-contact-column">
                {companyEmail ? (
                  <div className="invoice-contact-item">
                    <span className="invoice-contact-icon" aria-hidden="true">
                      <Mail />
                    </span>

                    <div>
                      <strong>Email:</strong>
                      <span>{companyEmail}</span>
                    </div>
                  </div>
                ) : null}

                {companyFacebook ? (
                  <div className="invoice-contact-item">
                    <span
                      className="invoice-contact-icon facebook-icon"
                      aria-hidden="true"
                    >
                      f
                    </span>

                    <div>
                      <strong>Facebook:</strong>
                      <span>{companyFacebook}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
          CUSTOMER / SALE INFORMATION
      ============================================================ */}

        <div className="invoice-info-grid">
          {/* LEFT */}

          <div className="invoice-info-column">
            <div className="invoice-info-row">
              <span className="invoice-info-label">Invoice No.</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value strong">
                {sale?.invoiceNumber || "—"}
              </span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Sold to</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value strong">{customerName}</span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Address</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{customerAddress}</span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Phone No.</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{customerPhone}</span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="invoice-info-column">
            <div className="invoice-info-row">
              <span className="invoice-info-label">Sales Person</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{salesPerson}</span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Remarks</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{paymentMethodDisplay}</span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Date</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{saleDate}</span>
            </div>

            <div className="invoice-info-row">
              <span className="invoice-info-label">Time</span>

              <span className="invoice-info-colon">:</span>

              <span className="invoice-info-value">{saleTime}</span>
            </div>
          </div>
        </div>

        {/* ============================================================
          PRODUCTS
      ============================================================ */}

        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>SL.</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Wty.</th>
                <th>U. Price</th>
                <th>T. Price</th>
              </tr>
            </thead>

            <tbody>
              {(sale?.items || []).map((item, index) => {
                const serials = serialsForItem(item);
                const warranty = warrantyForItem(item);

                return (
                  <tr key={item.id || index}>
                    {/* SL */}

                    <td>{index + 1}.</td>

                    {/* PRODUCT */}

                    <td>
                      <div className="invoice-product-name">
                        {item.productName || item.product?.name || "—"}
                      </div>

                      {item.productSku || item.product?.sku ? (
                        <div className="invoice-product-sku">
                          SKU: {item.productSku || item.product?.sku}
                        </div>
                      ) : null}

                      {serials.length > 0 ? (
                        <>
                          <div className="invoice-serial-title">
                            Serial No.:
                          </div>

                          <div className="invoice-serial-list">
                            {serials.map((serial, serialIndex) => (
                              <div key={`${serial}-${serialIndex}`}>
                                • {serial}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </td>

                    {/* QUANTITY */}

                    <td>{item.quantity ?? "—"}</td>

                    {/* WARRANTY */}

                    <td className="invoice-warranty">
                      {warranty != null ? warranty : "—"}
                    </td>

                    {/* UNIT PRICE */}

                    <td>{formatAmount(item.sellingPrice)}</td>

                    {/* TOTAL */}

                    <td>{formatAmount(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ============================================================
          TOTAL
      ============================================================ */}

        <div className="invoice-total-area">
          <div className="invoice-words">
            <span className="invoice-words-label">In Word (Taka)-</span>{" "}
            {amountWords}
          </div>

          <div className="invoice-grand-total">
            <span>G. Total-</span>

            <span className="invoice-grand-total-value">
              {formatAmount(sale?.total)}
            </span>
          </div>
        </div>

        {/* ============================================================
          FOOTER
      ============================================================ */}

        <div className="invoice-footer">
          <div className="invoice-signatures">
            <div className="invoice-signature">
              <div className="invoice-signature-line" />

              <div>Signature of Customer</div>
            </div>

            <div className="invoice-signature">
              <div className="invoice-signature-line" />

              <div className="invoice-signature-authorized">
                Authorized Signature
              </div>
            </div>
          </div>

          <div className="invoice-thank-you">Thank you for your purchase!</div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoice;
