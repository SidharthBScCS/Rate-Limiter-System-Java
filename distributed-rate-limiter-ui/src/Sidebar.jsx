import {
    LayoutGrid,
    Scale,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";


function Sidebar() {
    return (
        <>
            <div className="p-5 sidebar d-flex flex-column">

                <ul className="nav flex-column gap-5">

                    <li className="nav-item d-flex align-items-center gap-3">
                        <LayoutGrid size={25} />
                        <span className="sidebar-text">Dashboard</span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-3">
                        <Scale size={25} />
                        <span  className="sidebar-text">Rules & Limits </span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-3">
                        <BarChart3 size={25} />
                        <span  className="sidebar-text">Analytics</span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-3">
                        <Settings size={25} />
                        <span  className="sidebar-text">Settings</span>
                    </li>

                </ul>

                <div className='mt-auto gap-2'>
                    <li className='nav-item d-flex align-items-center gap-3'>
                        <LogOut size={25} />
                        <span  className="sidebar-text">Logout</span>
                    </li>
                </div>

            </div>

            
        </>
    )
}

export default Sidebar;