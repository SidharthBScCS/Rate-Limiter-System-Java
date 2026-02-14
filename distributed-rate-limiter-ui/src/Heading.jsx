import { Activity } from "lucide-react";

function Heading() {
  
  return (
    <>
      <nav className="navbar glass-navbar">
        <div className="container-fluid mt-3 px-4">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-wrapper">
                <Activity size={22} />
              </div>
              <div>
                <h4 className="dashboard-heading-title mb-0">Distributed Rate Limiter</h4>
                <p className="dashboard-heading-subtitle">Premium traffic control console</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Heading;
