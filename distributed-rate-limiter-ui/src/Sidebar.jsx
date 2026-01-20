import 'material-icons/iconfont/material-icons.css';

function Sidebar() {
    return (
        <>
            <div className="p-5 sidebar d-flex flex-column">

                <ul className="nav flex-column gap-4">

                    <li className="nav-item d-flex align-items-center gap-2">
                        <span className="material-icons">dashboard</span>
                        <span>Dashboard</span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-2">
                        <span class="material-icons">announcement</span>
                        <span>Rules & Limits </span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-2">
                        <span className='material-icons'>bar_chart</span>
                        <span>Analytics</span>
                    </li>

                    <li className="nav-item d-flex align-items-center gap-2">
                        <span className='material-icons'>settings</span>
                        <span>Settings</span>
                    </li>

                </ul>

                <div className='mt-auto gap-2'>
                    <li className='nav-item d-flex align-items-center gap-2'>
                        <span className='material-icons'>logout</span>
                        <span>Logout</span>
                    </li>
                </div>

            </div>

            
        </>
    )
}

export default Sidebar;