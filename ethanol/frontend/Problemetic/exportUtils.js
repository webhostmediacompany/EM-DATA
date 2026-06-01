import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================
   EXCEL EXPORT
============================================ */
export function exportToExcel(data = []) {
    if (!data || data.length === 0) {
        alert("No data available to export!");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Readings");
    XLSX.writeFile(wb, "readings.xlsx");
}

/* ============================================
   CSV EXPORT
============================================ */
export function exportToCSV(data = []) {
    if (!data || data.length === 0) {
        alert("No data available to export!");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "readings.csv");
}

/* ============================================
   PDF EXPORT
============================================ */
// export function exportToPDF(data = []) {
//     if (!data || data.length === 0) {
//         alert("No data available to export!");
//         return;
//     }

//     const doc = new jsPDF();
//     doc.text("Ethanol & Molasses Readings Report", 14, 10);

//     const tableData = data.map((r) => [
//         r.timestamp ? new Date(r.timestamp).toLocaleString() : "",
//         r.source || r.type || "N/A",
//         r.brix ?? "",
//         r.pol ?? "",
//         r.purity ?? "",
//         r.volume ?? "",
//     ]);

//     doc.autoTable({
//         head: [["Time", "Source", "Brix", "Pol", "Purity", "Volume"]],
//         body: tableData,
//         startY: 18,
//         styles: { fontSize: 9 },
//         headStyles: { fillColor: [50, 50, 50] },
//     });

//     doc.save("readings.pdf");
// }

export function exportToPDF(data = []) {
    if (!data || data.length === 0) {
        alert("No data available to export!");
        return;
    }

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "A4"
    });

    doc.setFontSize(16);
    doc.text("Ethanol & Molasses Readings Report", 40, 40);

    const tableHead = [
        ["Time", "Source", "Brix", "Pol", "Purity", "Volume", "Notes"]
    ];

    const tableBody = data.map((r) => [
        r.timestamp ? new Date(r.timestamp).toLocaleString() : "-",
        r.source || r.type || "N/A",
        r.brix ?? "-",
        r.pol ?? "-",
        r.purity ?? "-",
        r.volume ?? "-",
        r.notes ?? "-"
    ]);

    const autoTableOptions = {
        head: tableHead,
        body: tableBody,
        startY: 60,
        theme: "grid",
        styles: {
            fontSize: 10,
            cellPadding: 5,
            overflow: "linebreak"
        },
        headStyles: {
            fillColor: [53, 74, 95],
            textColor: "#fff",
            fontSize: 11
        },
        columnStyles: {
            0: { cellWidth: 140 }, // Time
            1: { cellWidth: 100 }, // Source
            6: { cellWidth: 200 } // Notes (long text)
        },
        margin: { top: 50, right: 20, bottom: 20, left: 20 }
    };

    if (typeof doc.autoTable === "function") {
        doc.autoTable(autoTableOptions);
    } else {
        autoTable(doc, autoTableOptions);
    }

    doc.save("readings.pdf");
}

/* ============================================
   PRINT TABLE
============================================ */
export function printTable() {
    try {
        window.print();
    } catch (err) {
        console.error("Print error:", err);
    }
}
