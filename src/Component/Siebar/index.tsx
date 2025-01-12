// Sidebar.tsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsOutline, Grid , CardOutline, BarChartOutline, CashOutline, CalculatorOutline, GolfOutline } from "react-ionicons";

const Sidebar = () => {
	const [activePage, setActivePage] = useState("home");
	const indicatorDiv = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	const sidebarItems = [
		{ title: "home", icon: Grid, path: "/" },
		{ title: "calculator", icon: CalculatorOutline, path: "/calculator"},
		{ title: "goals", icon: GolfOutline, path: "/goals"},
		{ title: "loan", icon: CardOutline, path: "/loan"},
		{ title: "charts", icon: BarChartOutline, path: "/charts"},
		{ title: "settlement", icon: CashOutline, path: "/settlement"},
		{ title: "settings", icon: SettingsOutline, path: "/settings" },
	];

	const handleItemClick = (item: any, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setActivePage(item.title);
		navigate(item.path);

		const offsetTop = e.currentTarget.offsetTop;
		const scrollTop = document.documentElement.scrollTop;
		const topPosition = `${offsetTop - scrollTop}px`;

		if (indicatorDiv.current) {
			indicatorDiv.current.style.top = topPosition;
		}
	};

	return (
		<div className="fixed left-0 top-[70px] w-[76px] h-[calc(100vh-70px)] shadow-sm bg-white border-r border-gray-200 flex items-center flex-col gap-5">
			<div
				className="w-[3px] h-[45px] bg-[#4379EE] absolute top-0 right-0 transition-all duration-300"
				ref={indicatorDiv}
			></div>
			{sidebarItems.map((item) => (
				<div
					key={item.title}
					className="cursor-pointer w-full py-2 flex items-center justify-center"
					onClick={(e) => handleItemClick(item, e)}
				>
					<item.icon
						color={activePage === item.title ? `#4379EE` : `#bfbfbf`}
						width="23px"
						height="23px"
						cssClasses={"transition-all duration-300"}
					/>
				</div>
			))}
		</div>
	);
};

export default Sidebar;
