import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import SaleInvoice from "../sales/SaleInvoice";
import { getSale } from "../../services/sales.service";
import "./invoice-print.css";

const InvoicePrint = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printedRef = useRef(false);

  useEffect(() => {
    const loadSale = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getSale(id);

        if (!result) {
          setError("Invoice not found.");
          return;
        }

        setSale(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load invoice for printing.");
      } finally {
        setLoading(false);
      }
    };

    void loadSale();
  }, [id]);

  useEffect(() => {
    const handleAfterPrint = () => {
      if (window.opener) {
        window.close();
      }
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const waitForFontsAndImages = async () => {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {
      // ignore font loading failures
    }

    const images = Array.from(document.images || []);

    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 5000);
        });
      }),
    );
  };

  const handleReadyToPrint = async () => {
    if (printedRef.current) {
      return;
    }

    printedRef.current = true;

    await waitForFontsAndImages();

    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="invoice-print-page">
      {loading ? (
        <div className="invoice-print-loading">Loading invoice...</div>
      ) : error ? (
        <div className="invoice-print-error">{error}</div>
      ) : (
        <SaleInvoice sale={sale} onReadyToPrint={handleReadyToPrint} />
      )}
    </div>
  );
};

export default InvoicePrint;
