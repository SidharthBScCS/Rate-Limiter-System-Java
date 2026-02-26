import React from 'react';
import './Analytics.css';
import { LineChart, ExternalLink } from 'lucide-react';

function Analytics() {
    const grafanaDashboardUrl = (import.meta.env.VITE_GRAFANA_DASHBOARD_URL || "").trim();

    return (
        <div className="analytics-page dark-theme">
            <div className="analytics-header">
                <div className="header-top">
                    <div>
                        <h1 className="page-title">Grafana Analytics</h1>
                        <p className="page-subtitle">Live dashboard powered by Grafana</p>
                    </div>
                </div>
            </div>

            <section className="grafana-section">
                <div className="graph-card grafana-card">
                    <div className="graph-header">
                        <h4 className="graph-title">
                            <LineChart size={18} />
                            Grafana Dashboard
                        </h4>
                        {grafanaDashboardUrl ? (
                            <a className="grafana-open-link" href={grafanaDashboardUrl} target="_blank" rel="noreferrer">
                                Open in Grafana
                                <ExternalLink size={14} />
                            </a>
                        ) : null}
                    </div>

                    {grafanaDashboardUrl ? (
                        <div className="grafana-frame-wrap">
                            <iframe
                                title="Grafana Analytics"
                                src={grafanaDashboardUrl}
                                className="grafana-frame"
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="grafana-empty">
                            Set <code>VITE_GRAFANA_DASHBOARD_URL</code> in UI environment to display Grafana here.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Analytics;
