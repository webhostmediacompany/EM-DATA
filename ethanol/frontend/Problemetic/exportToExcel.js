// src/exportUtils.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* --------------------------------------------------------
   EXPORT: EXCEL (XLSX)
---------------------------------------------------------*/
export function exportToExcel(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export!");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Readings");
    XLSX.writeFile(wb, "readings.xlsx");
}

/* --------------------------------------------------------
   EXPORT: CSV
---------------------------------------------------------*/
export function exportToCSV(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export!");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "readings.csv");
}

/* --------------------------------------------------------
   EXPORT: PDF
---------------------------------------------------------*/
export function exportToPDF(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
        alert("No data to export!");
        return;
    }

    const doc = new jsPDF();
    doc.text("Ethanol & Molasses Readings Report", 14, 10);

    const tableData = data.map((r) => [
        r.timestamp ? new Date(r.timestamp).toLocaleString() : "",
        r.source || r.type || "N/A",
        r.brix ?? "",
        r.pol ?? "",
        r.purity ?? "",
        r.volume ?? "",
    ]);

    doc.autoTable({
        head: [["Time", "Source", "Brix", "Pol", "Purity", "Volume"]],
        body: tableData,
        startY: 18,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save("readings.pdf");
}

/* --------------------------------------------------------
   PRINT PAGE
---------------------------------------------------------*/
export function printTable() {
    try {
        window.print();
    } catch (err) {
        console.error("Print error:", err);
        alert("Unable to print this page.");
    }
}
