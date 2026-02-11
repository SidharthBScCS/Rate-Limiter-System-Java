import { Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Copy, RefreshCw, Activity, Shield, Clock, User, Key, AlertCircle } from "lucide-react";
import './Table_Box.css';

function Main_Box({ refreshTick }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    let isMounted = true;
    fetch("/api/view/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setApiKeys(Array.isArray(data.apiKeys) ? data.apiKeys : []);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError("Unable to load API keys.");
          console.error("LOAD API KEYS ERROR:", err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    const cleanup = loadDashboard();
    return cleanup;
  }, [refreshTick]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="table-loading-container">
        <div className="table-loading">
          <Spinner animation="border" variant="primary" />
          <p className="loading-text">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Table Header */}
      <div className="table-header-card">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="table-title">API Keys Management</h4>
            <p className="table-subtitle">
              {apiKeys.length} {apiKeys.length === 1 ? 'API Key' : 'API Keys'} • 
              <span className="text-success"> Rate Limiter Active</span>
            </p>
          </div>
          <div className="d-flex gap-2">
            {loadError && (
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={() => window.location.reload()}
                className="refresh-btn"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {loadError && (
        <div className="table-error-alert">
          <div className="d-flex align-items-center gap-3">
            <div className="error-icon">
              <AlertCircle size={20} />
            </div>
            <div className="flex-grow-1">
              <h6 className="error-title">Error Loading Data</h6>
              <p className="error-message">{loadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="modern-table-container">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>
                  <div className="table-header-cell">
                    <Key size={16} />
                    <span>API Key</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <User size={16} />
                    <span>User</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <Activity size={16} />
                    <span>Rate Limit</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <Clock size={16} />
                    <span>Window</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <Activity size={16} />
                    <span>Requests</span>
                  </div>
                </th>
                <th>
                  <div className="table-header-cell">
                    <Shield size={16} />
                    <span>Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Key size={48} />
                      </div>
                      <h4>No API Keys Found</h4>
                      <p>Create your first API key to get started with rate limiting</p>
                    </div>
                  </td>
                </tr>
              ) : (
                apiKeys.map((item) => {
                  const apiKeyValue = item.apiKeyFull ?? "";
                  const status = item.status ?? "Normal";
                  const statusColor = item.statusColor ?? "#94a3b8";
                  const requestCount = item.requestCount ?? 0;
                  const usagePercentage = Number(item.usagePercentage ?? 0);
                  const usageColor = item.usageColor ?? "#10b981";
                  
                  return (
                    <tr key={item.id ?? item.apiKeyDisplay} className="table-data-row">
                      <td>
                        <div className="api-key-cell">
                          <div className="api-key-display">
                            <code>{item.apiKeyDisplay}</code>
                          </div>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="copy-btn"
                            onClick={() => copyToClipboard(apiKeyValue)}
                            title="Copy API Key"
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="owner-cell">
                          <span className="owner-name">{item.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rate-limit-cell">
                          <span className="rate-value">{item.rateLimit}</span>
                          <span className="rate-unit">requests</span>
                        </div>
                      </td>
                      <td>
                        <div className="window-cell">
                          <span className="window-value">{item.windowSeconds}</span>
                          <span className="window-unit">seconds</span>
                        </div>
                      </td>
                      <td>
                        <div className="requests-cell">
                          <div className="requests-info">
                            <span className="request-count">{requestCount}</span>
                            <span className="request-percentage" style={{ color: usageColor }}>
                              {usagePercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="usage-bar">
                            <div 
                              className="usage-progress" 
                              style={{ 
                                width: `${usagePercentage}%`,
                                backgroundColor: usageColor
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: statusColor, fontWeight: 600 }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Main_Box;
