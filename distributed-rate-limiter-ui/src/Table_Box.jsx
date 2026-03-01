import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiUrl } from "./apiBase";
import "./Table_Box.css";

function ApiTable({ refreshTick }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showKeys, setShowKeys] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchKeys();
  }, [refreshTick]);

  const fetchKeys = async () => {
    try {
      const res = await fetch(apiUrl("/api/view/dashboard"), { credentials: "include" });
      const data = await res.json();
      setKeys(data.apiKeys || []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Failed to fetch keys");
    } finally {
      setLoading(false);
    }
  };

  const filteredKeys = keys.filter(key => {
    const matchesSearch = key.userName?.toLowerCase().includes(search.toLowerCase()) ||
                         key.apiKeyDisplay?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || key.status?.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case "BLOCKED": return { bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444", dot: "#EF4444" };
      case "WARNING": return { bg: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", dot: "#F59E0B" };
      default: return { bg: "rgba(16, 185, 129, 0.1)", color: "#10B981", dot: "#10B981" };
    }
  };

  if (loading) {
    return <div className="table-skeleton" />;
  }

  return (
    <div className="api-table-container">
      <div className="table-header">
        <div>
          <h2>API Keys</h2>
          <p>Manage and monitor your API access keys</p>
        </div>
        <button className="create-btn">
          <Plus size={18} />
          New API Key
        </button>
      </div>

      <div className="table-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by user or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={16} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <button className="icon-btn">
          <Download size={16} />
        </button>
      </div>

      <div className="table-wrapper">
        <table className="api-table">
          <thead>
            <tr>
              <th>API Key</th>
              <th>User</th>
              <th>Rate Limit</th>
              <th>Window</th>
              <th>Algorithm</th>
              <th>Usage</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedKeys.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-content">
                    <div className="empty-icon">🔑</div>
                    <h3>No API keys found</h3>
                    <p>Get started by creating your first API key</p>
                    <button className="create-btn">
                      <Plus size={16} />
                      Create API Key
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedKeys.map((key) => {
                const status = getStatusColor(key.status);
                const usage = key.usagePercentage || 0;

                return (
                  <tr key={key.id} className="table-row">
                    <td>
                      <div className="key-cell">
                        <code className="key-code">
                          {showKeys[key.id] ? key.apiKeyFull : key.apiKeyDisplay}
                        </code>
                        <button 
                          className="action-btn"
                          onClick={() => setShowKeys(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                        >
                          {showKeys[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => navigator.clipboard.writeText(key.apiKeyFull)}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="user-name">{key.userName}</span>
                    </td>
                    <td>
                      <span className="rate-value">{key.rateLimit}</span>
                      <span className="rate-unit">/window</span>
                    </td>
                    <td>
                      <span className="window-value">{key.windowSeconds}s</span>
                    </td>
                    <td>
                      <span className="algo-badge">{key.algorithm}</span>
                    </td>
                    <td>
                      <div className="usage-cell">
                        <div className="usage-header">
                          <span>{key.requestCount || 0}</span>
                          <span style={{ color: usage > 80 ? '#EF4444' : '#10B981' }}>
                            {usage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="usage-bar">
                          <div 
                            className="usage-progress"
                            style={{ 
                              width: `${usage}%`,
                              background: usage > 80 ? '#EF4444' : '#10B981'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell" style={{ background: status.bg }}>
                        <span className="status-dot" style={{ background: status.dot }} />
                        <span style={{ color: status.color }}>{key.status || "NORMAL"}</span>
                      </div>
                    </td>
                    <td>
                      <button className="action-btn">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredKeys.length > 0 && (
        <div className="table-pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ApiTable;