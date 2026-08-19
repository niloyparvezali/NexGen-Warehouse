import { formatMoney } from "./formatters";

// Convert array of objects to CSV string
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return "";
  }

  // Create header row
  const headerRow = headers.join(",");

  // Create data rows
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || "";
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Convert array of objects to simple HTML table
const createHTMLTable = (data, headers) => {
  let html = '<table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">';

  // Header row
  html += "<thead><tr>";
  headers.forEach((header) => {
    html += `<th style="background-color: #F3F6F8; font-weight: bold;">${header}</th>`;
  });
  html += "</tr></thead>";

  // Data rows
  html += "<tbody>";
  data.forEach((row) => {
    html += "<tr>";
    headers.forEach((header) => {
      let value = row[header];
      // Format numbers
      if (typeof value === "number") {
        value = value.toFixed(2);
      }
      html += `<td>${value || ""}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  return html;
};

// Print report
export const printReport = (title, data, headers) => {
  const printWindow = window.open("", "", "height=600,width=800");
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .summary { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      ${createHTMLTable(data, headers)}
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

// Download Excel file (using simple HTML approach)
export const downloadExcel = (data, headers, filename) => {
  const html = createHTMLTable(data, headers);
  const element = document.createElement("a");

  // Create Excel content
  const excelContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 8px; }
        th { background-color: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  element.setAttribute(
    "href",
    "data:application/vnd.ms-excel;charset=utf-8," +
      encodeURIComponent(excelContent)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Download PDF (using a simple implementation)
// For production, consider using libraries like jsPDF or html2pdf
export const downloadPDF = (title, data, headers, filename) => {
  const html = createHTMLTable(data, headers);
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .header { text-align: center; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
      ${html}
    </body>
    </html>
  `;

  // For actual PDF, we'll download as HTML which can be printed to PDF
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(pdfContent)
  );
  element.setAttribute("download", filename.replace(".pdf", ".html"));
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Format currency
export const formatCurrency = (value) => formatMoney(value);

// Format date
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};
