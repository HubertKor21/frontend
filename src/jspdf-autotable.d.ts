// jspdf-autotable.d.ts
import { jsPDF } from "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable: any; // Add the autoTable method to jsPDF
    lastAutoTable: {
      finalY: number;
    };
  }
}
