import { useNavigate } from 'react-router-dom';
export function Navbar() {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  function Logout() {
    localStorage.clear();
    navigate("/login"); // Navigate to the login page
  }

  return (
		<div className="fixed left-0 top-0 w-full h-[70px] bg-white py-5 pl-20 pr-5 flex items-center justify-between z-[100]">
			<span className="text-[28px] font-black absolute left-[26px] text-[#4379EE]">H.</span>
			<div className="w-[450px] flex items-center px-4">
			</div>
			<div className="flex items-center gap-5">
                    <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li><a onClick={Logout}>Logout</a></li>
              </ul>
            </div>
            </div>
			</div>
		</div>
	);
}

export default Navbar;

