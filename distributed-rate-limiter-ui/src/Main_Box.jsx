import { Table } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";


function Main_Box({ refreshTick }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setApiKeys(Array.isArray(data) ? data : []);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError("Unable to load API keys.");
          console.error("LOAD API KEYS ERROR:", err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTick]);

  return (
    <div className="mt-4">
      {loadError ? (
        <div className="text-danger mb-2">{loadError}</div>
      ) : null}
      <div className="table-box">
        <div className="table-scroll">
          <Table hover borderless >
            <thead>
              <tr>
                <th className="text-white">API Key</th>
                <th className="text-white">Owner</th>
                <th className="text-white">Rate Limit</th>
                <th className="text-white">Window</th>
                <th className="text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((item) => {
                const status = item.status ?? "Normal";
                const statusColor = status.toLowerCase() === "blocked" ? "#d3172a" : "#28a745";
                return (
                <tr key={item.id ?? item.apiKey}>
                  <td className="bg-transparent text-white">{item.apiKey}</td>
                  <td className="bg-transparent text-white">{item.ownerName}</td>
                  <td className="bg-transparent text-white">{item.rateLimit}</td>
                  <td className="bg-transparent text-white">{item.windowSeconds}</td>
                  <td className="bg-transparent" style={{ color: statusColor, fontWeight: 600 }}>
                    {status}
                  </td>
                </tr>
              )})}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Main_Box;
