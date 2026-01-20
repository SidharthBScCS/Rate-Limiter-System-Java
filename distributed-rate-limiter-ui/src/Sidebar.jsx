function Sidebar() {
    return (
        <div className="p-5 sidebar">
            <ul className="nav flex-column gap-4">
                <li className="nav-item">Dashboard</li>
                <li className="nav-item">Rules & Limits</li>
                <li className="nav-item">Analytics</li>
                <li className="nav-item">Setings</li>
            </ul>
        </div>
    )
}

export default Sidebar;