interface FamilyModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCreateFamily: (familyName: string) => void;
  }
  
  const FamilyModal = ({ isVisible, onClose, onCreateFamily }: FamilyModalProps) => {
    if (!isVisible) return null; // Don't render the modal if it's not visible
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const familyName = (e.target as any).familyName.value;
      console.log("Creating family with name:", familyName); // Debugging log
      onCreateFamily(familyName); // Pass the family name to the parent component
    };
  
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-1/3 z-10"> {/* Ensure modal is above other elements */}
          <h2 className="text-xl font-bold mb-4">Create a New Family</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="familyName" className="block text-sm">Family Name</label>
              <input
                type="text"
                name="familyName"
                id="familyName"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={(e) => console.log("Create clicked")} // Debugging log
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Cancel clicked"); // Debugging log
                  onClose(); // Close the modal
                }}
                className="ml-2 py-2 px-4 border border-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default FamilyModal;
  