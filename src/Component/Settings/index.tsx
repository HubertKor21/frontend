import { useEffect, useState } from 'react';
import api from '../../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FamilyMember {
    email: string;
    first_name: string | null;
    last_name: string | null;
}

interface FamilyData {
    member_count: number;
    members: FamilyMember[];
    family_name: string;
}


interface Group {
    groups_title: string;
    groups_author: number;
    created_at: string;
    categories: {
        category_title: string;
        category_note: string;
        assigned_amount: number;
    }[];
    family: {
        name: string;
        members: number[];
    };
    category_count: number;
}

function SettingTable() {
    const [familyName, setFamilyName] = useState('');
    const [email, setEmail] = useState('');
    const [familyData, setFamilyData] = useState<FamilyData | null>(null);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [familysName, setFamilysName] = useState("");
    
    useEffect(() => {
        // Fetch family members when the component loads
        const fetchFamilyMembers = async () => {
            try {
                const response = await api.get('/api/families/members/');
                setFamilyData(response.data); // Assuming the API returns member_count and members
                setFamilyMembers(response.data.members); // Set the members array
            } catch (error) {
                console.log("Error fetching family members", error);
            }
        };
        fetchFamilyMembers();
    }, []);

    useEffect(() => {
        // Fetch group data when the component loads
        const fetchGroups = async () => {
            try {
                const response = await api.get('/api/groups/');
                setGroups(response.data); // Set the groups data
            } catch (error) {
                console.log("Error fetching groups data", error);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchFamilyName = async () => {
            try {
                const respone = await api.get("/api/families/name/")
                setFamilysName(respone.data.name);
                console.log(familysName);
            } catch (error) {
                console.log("Error fetching ", error);
            }
        };
        fetchFamilyName();
    },[]);

    const generatePDF = () => {
        const doc = new jsPDF();
    
    
        // Add group information
        let yPosition = 40; // Start position for the first group
        groups.forEach((group, groupIndex) => {
            // Add group title
            doc.setFontSize(14);
            doc.text(`Group: ${group.groups_title}`, 14, yPosition);
            yPosition += 10; // Move down after the group title
    
            // Add group categories in a table
            doc.autoTable({
                head: [['Category Title', 'Note', 'Assigned Amount']],
                body: group.categories.map(category => [
                    category.category_title,
                    category.category_note,
                    category.assigned_amount,
                ]),
                startY: yPosition, // Position table below the group title
                margin: { left: 14 }, // Align the table with the left margin
                didDrawPage: () => {
                    // Adjust for new page if needed
                    if (doc.lastAutoTable.finalY > 250) {
                        doc.addPage();
                        yPosition = 20; // Reset yPosition for the new page
                    }
                }
            });
    
            // Update yPosition for the next group
            yPosition = doc.lastAutoTable.finalY + 10; // Add some space between tables
        });
    
        doc.save('family_data.pdf');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && familyName) {
            // Call the API when the form is submitted
            api.post('/api/v1/invite/', {
                email,
                family_name: familyName,
            })
            .then(response => {
                setFamilyData(response.data); // Set the response to familyData
                setFamilyMembers(response.data.members); // Update family members
            })
            .catch(error => console.error("Error:", error));
        }
    };

    return (
        <div className="md:w-[95%] w-[80%] bg-white shadow-sm rounded-xl mt-10 px-5 py-4 mb-8">
            <div className="flex w-full items-center justify-between mb-6">
                <div className="md:w-[45%] w-[80%] bg-white shadow-sm rounded-xl mt-10 px-5 py-4 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Settings</h2>
                    <h3 className="text-md font-medium">Family name: {familysName}</h3>
                    <div className="mt-4 flex gap-2">
                        <button
                            className="bg-gray-600 text-white px-4 py-2 rounded-md"
                            onClick={generatePDF}
                        >
                            Eksport
                        </button>
                    </div>
                    <h3 className="text-md font-medium mt-6">Access to budget</h3>
                    <p className="text-sm mt-2">Email</p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-2">
                            <input
                                className="rounded-xl shadow-sm bg-slate-100 mt-2"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                            <input
                                className="rounded-xl shadow-sm bg-slate-100 mt-2"
                                type="text"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder="Enter the family name"
                                required
                            />
                            <button type="submit" className="ml-2 px-3 rounded-xl shadow-sm bg-green-600 text-black">
                                <p>Send</p>
                            </button>
                        </div>
                    </form>
                    <h3 className="text-md font-medium mt-6">Family members:</h3>
                    <p className="text-sm mt-2 text-gray-400">
                        {familyMembers ? (
                            familyMembers.map((member, index) => (
                                <span key={index}>
                                    {member.first_name && member.last_name
                                        ? `${member.first_name} ${member.last_name} - ${member.email}`
                                        : `${member.email}`}
                                    <br />
                                </span>
                            ))
                        ) : (
                            <span>No family members</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SettingTable;
