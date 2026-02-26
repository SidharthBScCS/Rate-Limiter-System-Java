import { Activity } from "lucide-react";

function Heading() {
  
  return (
    <>
      <nav className="navbar navbar-dark glass-navbar">
        <div className="container-fluid mt-3 px-4">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-wrapper">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white mb-0 fw-bold app-title">Distributed Rate Limiter</h4>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Heading;
