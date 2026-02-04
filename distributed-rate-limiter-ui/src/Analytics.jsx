import React, { useEffect, useState } from 'react';
import './Analytics.css';
import { LineChart } from 'lucide-react';

function Analytics() {
    const [view, setView] = useState({
        labels: [],
        totalRequests: [],
        successRequests: [],
        blockedRequests: [],
        summary: { total: 0, success: 0, blocked: 0 },
        maxValue: 1
    });
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        fetch("/api/analytics/view", { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setView({
                        labels: Array.isArray(data.labels) ? data.labels : [],
                        totalRequests: Array.isArray(data.totalRequests) ? data.totalRequests : [],
                        successRequests: Array.isArray(data.successRequests) ? data.successRequests : [],
                        blockedRequests: Array.isArray(data.blockedRequests) ? data.blockedRequests : [],
                        summary: data.summary ?? { total: 0, success: 0, blocked: 0 },
                        maxValue: data.maxValue ?? 1
                    });
                    setLoadError("");
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("LOAD ANALYTICS ERROR:", err);
                    setLoadError("Unable to load analytics data.");
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const calculateLinePath = (values) => {
        if (!values.length || view.maxValue === 0) return 'none';
        const points = values.map((value, index) => {
            const x = view.labels.length <= 1 ? 0 : (index / (view.labels.length - 1)) * 100;
            const y = (value / view.maxValue) * 100;
            return `${x}% ${100 - y}%`;
        });
        return `polygon(0 100%, ${points.join(', ')}, 100% 100%)`;
    };

    return (
        <div className="analytics-page dark-theme">
            <div className="analytics-header">
                <div className="header-top">
                    <div>
                        <h1 className="page-title">API Analytics Dashboard</h1>
                        <p className="page-subtitle">API key totals from MySQL</p>
                    </div>
                </div>
            </div>

            {loadError ? (
                <div className="graph-error">
                    {loadError}
                </div>
            ) : null}

            <div className="graphs-section">
                <div className="graph-card line-graph-card">
                    <div className="graph-header">
                        <h4 className="graph-title">
                            <LineChart size={18} />
                            Total Requests (by Owner)
                        </h4>
                        <div className="graph-stats">
                            <span className="graph-value">{view.summary.total.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * view.maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path total"
                                    style={{ clipPath: calculateLinePath(view.totalRequests) }}
                                ></div>

                                {view.totalRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point total"
                                        style={{
                                            left: `${view.labels.length <= 1 ? 0 : (index / (view.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / view.maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {view.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {view.labels.map((label, index) => (
                                    <div key={index} className="x-label">{label}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="graph-card line-graph-card">
                    <div className="graph-header">
                        <h4 className="graph-title">
                            <LineChart size={18} />
                            Success Requests (by Owner)
                        </h4>
                        <div className="graph-stats">
                            <span className="graph-value">{view.summary.success.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * view.maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path success"
                                    style={{ clipPath: calculateLinePath(view.successRequests) }}
                                ></div>

                                {view.successRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point success"
                                        style={{
                                            left: `${view.labels.length <= 1 ? 0 : (index / (view.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / view.maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {view.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {view.labels.map((label, index) => (
                                    <div key={index} className="x-label">{label}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="graph-card line-graph-card">
                    <div className="graph-header">
                        <h4 className="graph-title">
                            <LineChart size={18} />
                            Blocked Requests (by Owner)
                        </h4>
                        <div className="graph-stats">
                            <span className="graph-value">{view.summary.blocked.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * view.maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path blocked"
                                    style={{ clipPath: calculateLinePath(view.blockedRequests) }}
                                ></div>

                                {view.blockedRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point blocked"
                                        style={{
                                            left: `${view.labels.length <= 1 ? 0 : (index / (view.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / view.maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {view.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {view.labels.map((label, index) => (
                                    <div key={index} className="x-label">{label}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
