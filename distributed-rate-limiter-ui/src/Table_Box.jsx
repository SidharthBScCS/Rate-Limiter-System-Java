import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  RefreshCw,
  Activity,
  Shield,
  Clock,
  User,
  Key,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import "./Table_Box.css";
import { apiUrl } from "./apiBase";

function deriveStatusMeta(item) {
  const sourceStatus = String(item.status ?? "NORMAL").toUpperCase();

  if (sourceStatus === "BLOCKED") {
    return {
      label: "Blocked",
      value: "BLOCKED",
      color: item.statusColor ?? "#f87171",
    };
  }

  if (sourceStatus === "WARNING") {
    return {
      label: "Warning",
      value: "WARNING",
      color: item.statusColor ?? "#fbbf24",
    };
  }

  return {
    label: "Normal",
    value: "NORMAL",
    color: item.statusColor ?? "#86efac",
  };
}

function Main_Box({ refreshTick }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [algorithmFilter, setAlgorithmFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create API key modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [createForm, setCreateForm] = useState({
    userName: "",
    rateLimit: 100,
    windowSeconds: 60,
    algorithm: "SLIDING_WINDOW",
  });

  const loadDashboard = () => {
    setLoading(true);
    let isMounted = true;
    fetch(apiUrl("/api/view/dashboard"), { credentials: "include" })
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
      .catch(() => {
        if (isMounted) {
          setLoadError("Unable to load API keys.");
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

  const filteredApiKeys = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return apiKeys.filter((item) => {
      const algorithm = String(item.algorithm ?? "SLIDING_WINDOW").toUpperCase();
      const statusMeta = deriveStatusMeta(item);
      const matchesAlgorithm = algorithmFilter === "ALL" || algorithm === algorithmFilter;
      const matchesStatus = statusFilter === "ALL" || statusMeta.value === statusFilter;
      if (!matchesAlgorithm || !matchesStatus) {
        return false;
      }
      if (!query) {
        return true;
      }
      const searchable = [item.userName, item.apiKeyDisplay, item.algorithm, statusMeta.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [apiKeys, searchText, algorithmFilter, statusFilter]);

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
      <div className="table-header-card">
        <div className="table-header-row">
          <div>
            <h4 className="table-title">API Keys Management</h4>
            <p className="table-subtitle">
              {filteredApiKeys.length} of {apiKeys.length} {apiKeys.length === 1 ? "API Key" : "API Keys"} •
              <span className="table-health"> Rate Limiter Active</span>
            </p>
          </div>
          <div className="table-header-actions">
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

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateError("");
                setCreatedKey(null);
                setShowCreate(true);
              }}
              className="create-btn"
              style={{ marginLeft: 8 }}
            >
              Create API Key
            </Button>
          </div>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="table-search-box">
          <Search size={16} />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by user, API key, algorithm..."
          />
        </div>
        <div className="table-filter-group">
          <div className="table-select-wrap">
            <Filter size={14} />
            <select value={algorithmFilter} onChange={(e) => setAlgorithmFilter(e.target.value)}>
              <option value="ALL">All Algorithms</option>
              <option value="SLIDING_WINDOW">Sliding Window</option>
              <option value="TOKEN_BUCKET">Token Bucket</option>
              <option value="FIXED_WINDOW">Fixed Window</option>
              <option value="LEAKY_BUCKET">Leaky Bucket</option>
              <option value="COMBINED">Combined</option>
            </select>
          </div>
          <div className="table-select-wrap">
            <Shield size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="NORMAL">Normal</option>
              <option value="BLOCKED">Blocked</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="table-error-alert">
          <div className="table-error-content">
            <div className="error-icon">
              <AlertCircle size={20} />
            </div>
            <div className="table-error-body">
              <h6 className="error-title">Error Loading Data</h6>
              <p className="error-message">{loadError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="modern-table-container">
        <div className="table-wrapper desktop-table-view">
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
                    <Shield size={16} />
                    <span>Algorithm</span>
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
              {filteredApiKeys.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Key size={48} />
                      </div>
                      <h4>No Matching API Keys</h4>
                      <p>Adjust search/filter settings and try again.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApiKeys.map((item) => {
                  const apiKeyValue = item.apiKeyFull ?? "";
                  const requestCount = Number(item.requestCount ?? 0);
                  const statusMeta = deriveStatusMeta(item);
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
                        <span className="algorithm-pill">{item.algorithm ?? "SLIDING_WINDOW"}</span>
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
                                backgroundColor: usageColor,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="status-pill" style={{ color: statusMeta.color }}>
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mobile-api-list">
          {filteredApiKeys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Key size={48} />
              </div>
              <h4>No Matching API Keys</h4>
              <p>Adjust search/filter settings and try again.</p>
            </div>
          ) : (
            filteredApiKeys.map((item) => {
              const apiKeyValue = item.apiKeyFull ?? "";
              const requestCount = Number(item.requestCount ?? 0);
              const statusMeta = deriveStatusMeta(item);
              const usagePercentage = Number(item.usagePercentage ?? 0);
              const usageColor = item.usageColor ?? "#10b981";

              return (
                <div key={item.id ?? item.apiKeyDisplay} className="mobile-api-card">
                  <div className="mobile-api-card-top">
                    <code>{item.apiKeyDisplay}</code>
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
                  <div className="mobile-api-meta">
                    <span>{item.userName}</span>
                    <span className="algorithm-pill">{item.algorithm ?? "SLIDING_WINDOW"}</span>
                  </div>
                  <div className="mobile-api-meta">
                    <span>{item.rateLimit} req</span>
                    <span>{item.windowSeconds}s window</span>
                  </div>
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
                          backgroundColor: usageColor,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mobile-api-status">
                    <span className="status-pill" style={{ color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create API Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createdKey ? (
            <div style={{ textAlign: "center" }}>
              <p>Your API key was created successfully.</p>
              <code style={{ display: "block", wordBreak: "break-all", marginBottom: 8 }}>{createdKey}</code>
              <div>
                <Button variant="outline-primary" size="sm" onClick={() => copyToClipboard(createdKey)}>
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <>
              {createError && <div className="form-error">{createError}</div>}
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    value={createForm.userName}
                    onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                    placeholder="Owner / user name"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Rate Limit (requests)</Form.Label>
                  <Form.Control
                    type="number"
                    value={createForm.rateLimit}
                    onChange={(e) => setCreateForm({ ...createForm, rateLimit: Number(e.target.value) })}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Window Seconds</Form.Label>
                  <Form.Control
                    type="number"
                    value={createForm.windowSeconds}
                    onChange={(e) => setCreateForm({ ...createForm, windowSeconds: Number(e.target.value) })}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Algorithm</Form.Label>
                  <Form.Select
                    value={createForm.algorithm}
                    onChange={(e) => setCreateForm({ ...createForm, algorithm: e.target.value })}
                  >
                    <option value="SLIDING_WINDOW">Sliding Window</option>
                    <option value="TOKEN_BUCKET">Token Bucket</option>
                    <option value="FIXED_WINDOW">Fixed Window</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={createSubmitting}>
            Close
          </Button>
          {!createdKey && (
            <Button
              variant="primary"
              onClick={async () => {
                setCreateError("");
                setCreateSubmitting(true);
                try {
                  const res = await fetch(apiUrl("/api/keys"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(createForm),
                  });
                  const text = await res.text();
                  if (!res.ok) {
                    try {
                      const json = JSON.parse(text);
                      throw new Error(json.message || text || res.statusText);
                    } catch (e) {
                      throw new Error(text || res.statusText);
                    }
                  }
                  const data = JSON.parse(text);
                  setCreatedKey(data.apiKey ?? data.apiKeyFull ?? "");
                  // refresh dashboard list
                  loadDashboard();
                } catch (err) {
                  setCreateError(err.message || "Unable to create API key.");
                } finally {
                  setCreateSubmitting(false);
                }
              }}
              disabled={createSubmitting}
            >
              {createSubmitting ? <Spinner size="sm" animation="border" /> : "Create"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Main_Box;
