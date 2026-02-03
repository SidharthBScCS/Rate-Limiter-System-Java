import React, { useEffect, useMemo, useState } from 'react';
import './Analytics.css';
import { Download, RefreshCw, LineChart } from 'lucide-react';

function Analytics() {
    const [keyStats, setKeyStats] = useState([]);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        fetch("/api/analytics/keys")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setKeyStats(Array.isArray(data) ? data : []);
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

    const lineGraphData = useMemo(() => {
        const safe = Array.isArray(keyStats) ? keyStats : [];
        const topKeys = [...safe]
            .sort((a, b) => Number(b.totalRequests ?? 0) - Number(a.totalRequests ?? 0))
            .slice(0, 7);
        return {
            labels: topKeys.map((item) => item.ownerName ?? "Unknown"),
            totalRequests: topKeys.map((item) => Number(item.totalRequests ?? 0)),
            successRequests: topKeys.map((item) => Number(item.allowedRequests ?? 0)),
            blockedRequests: topKeys.map((item) => Number(item.blockedRequests ?? 0)),
        };
    }, [keyStats]);

    const summary = useMemo(() => {
        return {
            total: lineGraphData.totalRequests.reduce((a, b) => a + b, 0),
            success: lineGraphData.successRequests.reduce((a, b) => a + b, 0),
            blocked: lineGraphData.blockedRequests.reduce((a, b) => a + b, 0),
        };
    }, [lineGraphData]);

    const maxValue = useMemo(() => {
        return Math.max(
            1,
            ...lineGraphData.totalRequests,
            ...lineGraphData.successRequests,
            ...lineGraphData.blockedRequests
        );
    }, [lineGraphData]);

    const calculateLinePath = (values) => {
        if (!values.length || maxValue === 0) return 'none';
        const points = values.map((value, index) => {
            const x = lineGraphData.labels.length <= 1 ? 0 : (index / (lineGraphData.labels.length - 1)) * 100;
            const y = (value / maxValue) * 100;
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
                            <span className="graph-value">{summary.total.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path total"
                                    style={{ clipPath: calculateLinePath(lineGraphData.totalRequests) }}
                                ></div>

                                {lineGraphData.totalRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point total"
                                        style={{
                                            left: `${lineGraphData.labels.length <= 1 ? 0 : (index / (lineGraphData.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {lineGraphData.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {lineGraphData.labels.map((label, index) => (
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
                            <span className="graph-value">{summary.success.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path success"
                                    style={{ clipPath: calculateLinePath(lineGraphData.successRequests) }}
                                ></div>

                                {lineGraphData.successRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point success"
                                        style={{
                                            left: `${lineGraphData.labels.length <= 1 ? 0 : (index / (lineGraphData.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {lineGraphData.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {lineGraphData.labels.map((label, index) => (
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
                            <span className="graph-value">{summary.blocked.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="graph-content">
                        <div className="line-graph-container">
                            <div className="grid-lines">
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <div key={i} className="grid-line" style={{ bottom: `${percent}%` }}>
                                        <span className="grid-label">
                                            {Math.round((percent / 100) * maxValue).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="line-graph">
                                <div
                                    className="line-path blocked"
                                    style={{ clipPath: calculateLinePath(lineGraphData.blockedRequests) }}
                                ></div>

                                {lineGraphData.blockedRequests.map((value, index) => (
                                    <div
                                        key={index}
                                        className="data-point blocked"
                                        style={{
                                            left: `${lineGraphData.labels.length <= 1 ? 0 : (index / (lineGraphData.labels.length - 1)) * 100}%`,
                                            bottom: `${(value / maxValue) * 100}%`
                                        }}
                                    >
                                        <div className="point-tooltip">
                                            {lineGraphData.labels[index]}: {value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="x-axis">
                                {lineGraphData.labels.map((label, index) => (
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
