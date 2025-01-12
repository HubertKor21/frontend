import { useEffect, useState } from "react";
import LoanModal from "../LoanModal";
import api from "../../api";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Dla obsługi tabel
import { toast, ToastContainer } from "react-toastify";



interface LoanFormData {
  id: number;
  name: string;
  amount_reaming: number;
  loan_type: "fixed" | "decreasing";
  interest_rate: number;
  payment_day: number;
  last_payment_date: string;
  installments_remaining: number;
}

interface LoanInstallmentData {
  loan_name: string;
  loan_type: "fixed" | "decreasing";
  total_amount_remaining: string;
  interest_rate: string;
  installments_remaining: number;
  installments: number[];
}

function LoanPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [loans, setLoans] = useState<LoanFormData[]>([]);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<number | null>(null);
  const [, setLoanData] = useState<LoanInstallmentData | null>(null);
  const [tableData, setTableData] = useState<
    { installmentNumber: number; capitalPart: string; interestPart: string; totalInstallment: string }[]
  >([]);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleOpenDownloadModal = () => setDownloadModalOpen(true);
  const handleCloseDownloadModal = () => setDownloadModalOpen(false);

  const handleAddLoan = async (data: LoanFormData) => {
    try {
      const response = await api.post("/api/loans/", data);
      setLoans((prevLoans) => [...prevLoans, response.data]);
    } catch (error) {
      console.error("Failed to add loan:", error);
      alert("Wystąpił błąd podczas dodawania kredytu.");
    }
  };

  const handleLoanSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.value ? parseInt(event.target.value) : null;
    setSelectedLoanIndex(selectedIndex);

    if (selectedIndex !== null) {
      try {
        const response = await api.get(`/api/loan/${loans[selectedIndex].id}/installments/`);
        setLoanData(response.data);

        const installments = response.data.installments || [];
        const totalAmountRemaining = parseFloat(response.data.total_amount_remaining);
        const capitalPart = totalAmountRemaining / installments.length;

        const tableData = installments.map((interestPart: number, index: number) => {
          const installmentNumber = index + 1;
          const interestParts = interestPart - capitalPart;
          const totalInstallment = capitalPart + interestParts;
          return {
            installmentNumber,
            capitalPart: capitalPart.toFixed(2),
            interestPart: interestParts.toFixed(2),
            totalInstallment: totalInstallment.toFixed(2),
          };
        });

        setTableData(tableData);
      } catch (error) {
        console.error("Failed to fetch loan data:", error);
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumns = ["Numer raty", "Czesc kapitalowa raty", "Czesc odsetkowa raty", "Wysokosc raty"];
    const tableRows = tableData.map(row => [
      row.installmentNumber,
      `${row.capitalPart} zl`,
      `${row.interestPart} zl`,
      `${row.totalInstallment} zl`,
    ]);

    // Obliczanie sum
    const totalCapital = tableData.reduce((sum, row) => sum + parseFloat(row.capitalPart), 0).toFixed(2);
    const totalInterest = tableData.reduce((sum, row) => sum + parseFloat(row.interestPart), 0).toFixed(2);
    const totalInstallment = tableData.reduce((sum, row) => sum + parseFloat(row.totalInstallment), 0).toFixed(2);

    // Dodanie wiersza sumy
    tableRows.push(["SUMA:", `${totalCapital} zł`, `${totalInterest} zł`, `${totalInstallment} zł`]);

    doc.text("Tabela rat kredytu", 14, 10);
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 20,
    });

    doc.save("Tabela_rat_kredytu.pdf");
    toast.success("PDF został pobrany!");

  };

  const handleDeleteLoan = async () => {
    if (loanToDelete !== null) {
      try {
        await api.delete(`/api/loans/${loanToDelete}/`);
        setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== loanToDelete));
      } catch (error) {
        console.error("Failed to delete loan:", error);
      } finally {
        setConfirmDeleteModal(false);
        setLoanToDelete(null);
      }
    }
  };

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await api.get("/api/loans/");
        setLoans(response.data);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className="md:w-[95%] w-[80%] bg-white shadow-xl rounded-lg mt-10 px-6 py-6 mb-8">
      <div className="flex w-full items-center justify-between mb-6">
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Dodaj Kredyt
        </button>
      </div>

      <LoanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={(data: LoanFormData) => handleAddLoan(data)}
      />

      <div className="flex items-center mb-4">
        <select
          onChange={handleLoanSelect}
          value={selectedLoanIndex ?? ""}
          className="p-3 border border-gray-300 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Wybierz kredyt
          </option>
          {loans.map((loan, index) => (
            <option key={loan.id} value={index}>
              {loan.name} - {loan.amount_reaming} zł
            </option>
          ))}
        </select>

        <button
          onClick={handleOpenDownloadModal}
          className="bg-green-600 text-white px-5 ml-4 py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          disabled={tableData.length === 0}
        >
          Pobierz PDF
        </button>
      </div>

      {selectedLoanIndex !== null && loans[selectedLoanIndex] && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Szczegóły Kredytu</h3>
          <p><strong>Typ kredytu:</strong> {loans[selectedLoanIndex].loan_type}</p>
          <p><strong>Kwota:</strong> {loans[selectedLoanIndex].amount_reaming} zł</p>
          <p><strong>Oprocentowanie:</strong> {loans[selectedLoanIndex].interest_rate}%</p>
          <p><strong>Rata pozostała:</strong> {loans[selectedLoanIndex].installments_remaining}</p>
          <p><strong>Data ostatniej spłaty:</strong> {loans[selectedLoanIndex].last_payment_date}</p>
          <div>
            <button 
              onClick={() => {
                setLoanToDelete(loans[selectedLoanIndex].id);
                setConfirmDeleteModal(true);
              }}
              className="text-red-500 hover:text-red-700 transition duration-300"
              title="Usuń kredyt"
            >
              X
            </button>
          </div>
        </div>
      )}

      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p>Czy na pewno chcesz usunąć ten kredyt?</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={handleDeleteLoan}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition duration-300"
              >
                Tak
              </button>
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition duration-300"
              >
                Nie
              </button>
            </div>
          </div>
        </div>
      )}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p>Chcesz pobrać tabelę rat kredytu jako PDF?</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300"
              >
                Pobierz PDF
              </button>
              <button
                onClick={handleCloseDownloadModal}
                className="bg-gray-300 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition duration-300"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {tableData.length > 0 && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Szczegóły Rat Kredytu</h3>
          <table className="table-auto w-full border-collapse border border-gray-300 shadow-md">
            <thead className="bg-blue-100">
              <tr>
                <th className="border border-gray-300 px-6 py-3">Numer raty</th>
                <th className="border border-gray-300 px-6 py-3">Część kapitałowa raty</th>
                <th className="border border-gray-300 px-6 py-3">Część odsetkowa raty</th>
                <th className="border border-gray-300 px-6 py-3">Wysokość raty</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.installmentNumber} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-3">{row.installmentNumber}</td>
                  <td className="border border-gray-300 px-6 py-3">{row.capitalPart} zł</td>
                  <td className="border border-gray-300 px-6 py-3">{row.interestPart} zł</td>
                  <td className="border border-gray-300 px-6 py-3">{row.totalInstallment} zł</td>
                </tr>
              ))}
              <tr className="font-semibold text-gray-700">
                <td className="border border-gray-300 px-6 py-3">SUMA:</td>
                <td className="border border-gray-300 px-6 py-3">{tableData.reduce((sum, row) => sum + parseFloat(row.capitalPart), 0).toFixed(2)} zł</td>
                <td className="border border-gray-300 px-6 py-3">{tableData.reduce((sum, row) => sum + parseFloat(row.interestPart), 0).toFixed(2)} zł</td>
                <td className="border border-gray-300 px-6 py-3">{tableData.reduce((sum, row) => sum + parseFloat(row.totalInstallment), 0).toFixed(2)} zł</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer />
    </div>
    
  );
}

export default LoanPage;
