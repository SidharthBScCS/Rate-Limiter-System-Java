import { useState, useEffect } from "react";
import { Plus, Copy } from "lucide-react";
import { apiUrl } from "./apiBase";
import "./Table_Box.css";

function ApiTable({ refreshTick }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    userName: "",
    rateLimit: "10",
    windowSeconds: "60",
    algorithm: "SLIDING_WINDOW",
  });
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [refreshTick]);

  const fetchKeys = async () => {
    try {
      const res = await fetch(apiUrl("/api/view/dashboard"), { credentials: "include" });
      const data = await res.json();
      setKeys(data.apiKeys || []);
    } catch {
      console.error("Failed to fetch keys");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "BLOCKED":
        return { bg: "rgba(248, 81, 73, 0.14)", color: "#F85149", dot: "#F85149" };
      case "WARNING":
        return { bg: "rgba(210, 153, 34, 0.14)", color: "#D29922", dot: "#D29922" };
      default:
        return { bg: "rgba(63, 185, 80, 0.14)", color: "#3FB950", dot: "#3FB950" };
    }
  };

  if (loading) {
    return <div className="table-skeleton" />;
  }

  const openCreateModal = () => {
    setCreateError("");
    setFormState({
      userName: "",
      rateLimit: "10",
      windowSeconds: "60",
      algorithm: "SLIDING_WINDOW",
    });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
  };

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateApiKey = async (event) => {
    event.preventDefault();
    setCreateError("");
    setIsSubmitting(true);

    const payload = {
      userName: formState.userName.trim(),
      rateLimit: Number(formState.rateLimit),
      windowSeconds: Number(formState.windowSeconds),
      algorithm: formState.algorithm,
    };

    try {
      const response = await fetch(apiUrl("/api/keys"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
        const message =
          (typeof body === "object" && body && body.message) ||
          (typeof body === "string" && body) ||
          "Failed to create API key";
        throw new Error(message);
      }

      await fetchKeys();
      setIsCreateModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create API key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="api-table-container">
      <div className="table-header">
        <div>
          <h2>API Keys</h2>
          <p>Manage and monitor your API access keys</p>
        </div>
        <button className="create-btn" onClick={openCreateModal}>
          <Plus size={18} />
          New API Key
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
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-content">
                    <h3>NO API KEY FOUND</h3>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((key) => {
                const status = getStatusColor(key.status);
                const usage = key.usagePercentage || 0;
                const fullApiKey = key.apiKey || key.apiKeyFull || key.apiKeyDisplay || "";

                return (
                  <tr key={key.id} className="table-row">
                    <td>
                      <div className="key-cell">
                        <code className="key-code">{fullApiKey}</code>
                        <button
                          className="action-btn"
                          onClick={() => navigator.clipboard.writeText(fullApiKey)}
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
                          <span>{key.requestCount || 0} req</span>
                          <span style={{ color: usage > 80 ? "#F85149" : "#3FB950" }}>
                            {usage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="usage-bar">
                          <div
                            className="usage-progress"
                            style={{
                              width: `${usage}%`,
                              background: usage > 80 ? "#F85149" : "#3FB950",
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen ? (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Create API Key</h3>
            <form className="create-form" onSubmit={handleCreateApiKey}>
              <label>
                User Name
                <input
                  type="text"
                  value={formState.userName}
                  onChange={(event) => updateField("userName", event.target.value)}
                  required
                />
              </label>

              <label>
                Rate Limit
                <input
                  type="number"
                  min="1"
                  value={formState.rateLimit}
                  onChange={(event) => updateField("rateLimit", event.target.value)}
                  required
                />
              </label>

              <label>
                Window (seconds)
                <input
                  type="number"
                  min="1"
                  value={formState.windowSeconds}
                  onChange={(event) => updateField("windowSeconds", event.target.value)}
                  required
                />
              </label>

              <label>
                Algorithm
                <select
                  value={formState.algorithm}
                  onChange={(event) => updateField("algorithm", event.target.value)}
                >
                  <option value="SLIDING_WINDOW">SLIDING_WINDOW</option>
                  <option value="TOKEN_BUCKET">TOKEN_BUCKET</option>
                  <option value="FIXED_WINDOW">FIXED_WINDOW</option>
                </select>
              </label>

              {createError ? <p className="create-error">{createError}</p> : null}

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeCreateModal} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="create-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create API Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ApiTable;

