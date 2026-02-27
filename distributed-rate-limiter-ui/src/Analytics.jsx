import React from "react";
import "./Analytics.css";

function Analytics() {
  const grafanaDashboardUrl = (import.meta.env.VITE_GRAFANA_DASHBOARD_URL || "").trim();
  const [embedBlocked, setEmbedBlocked] = React.useState(false);
  const grafanaEmbedUrl = (() => {
    if (!grafanaDashboardUrl) return "";
    try {
      const url = new URL(grafanaDashboardUrl);
      url.searchParams.set("kiosk", "tv");
      return url.toString();
    } catch {
      return grafanaDashboardUrl;
    }
  })();

  return (
    <div className="analytics-page dark-theme page-full-bleed analytics-full">
      <section className="grafana-full-section">
        {grafanaEmbedUrl ? (
          <div className="grafana-frame-wrap grafana-frame-wrap--full">
            <iframe
              title="Grafana Analytics"
              src={grafanaEmbedUrl}
              className="grafana-frame grafana-frame--full"
              loading="lazy"
              onError={() => setEmbedBlocked(true)}
            />
            {embedBlocked ? (
              <div className="grafana-empty">
                Embedding is blocked by Grafana security headers. Use <code>Open in Grafana</code>.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grafana-empty">
            Set <code>VITE_GRAFANA_DASHBOARD_URL</code> in UI environment to display Grafana here.
          </div>
        )}
      </section>
    </div>
  );
}

export default Analytics;
