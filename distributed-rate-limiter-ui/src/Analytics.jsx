import React, { useEffect, useState } from 'react';
import './Analytics.css';
import { 
    LineChart, 
    Activity, 
    ShieldCheck, 
    ShieldX, 
    RefreshCw, 
    TrendingUp,
    TrendingDown,
    Clock
} from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/analytics/view`, { 
                credentials: "include" 
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }
            
            const data = await response.json();
            
            setView({
                labels: Array.isArray(data.labels) ? data.labels : [],
                totalRequests: Array.isArray(data.totalRequests) ? data.totalRequests : [],
                successRequests: Array.isArray(data.successRequests) ? data.successRequests : [],
                blockedRequests: Array.isArray(data.blockedRequests) ? data.blockedRequests : [],
                summary: data.summary ?? { total: 0, success: 0, blocked: 0 },
                maxValue: data.maxValue ?? 1
            });
            setLoadError("");
        } catch (err) {
            console.error("LOAD ANALYTICS ERROR:", err);
            setLoadError("Unable to load analytics data. Please try again.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchAnalytics();
    };

    const calculateLinePath = (values) => {
        if (!values.length || view.maxValue === 0) return 'none';
        const points = values.map((value, index) => {
            const x = view.labels.length <= 1 ? 0 : (index / (view.labels.length - 1)) * 100;
            const y = (value / view.maxValue) * 100;
            return `${x}% ${100 - y}%`;
        });
        return `polygon(0 100%, ${points.join(', ')}, 100% 100%)`;
    };

    const formatAxisLabel = (label) => {
        if (!label) return "";
        const text = String(label);
        if (text.length <= 10) return text;
        return `${text.slice(0, 5)}...${text.slice(-4)}`;
    };

    const total = Number(view.summary.total ?? 0);
    const success = Number(view.summary.success ?? 0);
    const blocked = Number(view.summary.blocked ?? 0);
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : "0.0";
    const blockedRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : "0.0";

    // Calculate trends (mock data - replace with actual trend data from API)
    const trends = {
        total: total > 1000 ? 'up' : 'down',
        success: successRate > 75 ? 'up' : 'down',
        blocked: blockedRate < 10 ? 'down' : 'up'
    };

    return (
        <div className="analytics-page dark-theme">
            <div className="analytics-header">
                <div className="header-top">
                    <div className="title-section">
                        <h1 className="page-title">API Analytics Dashboard</h1>
                        <p className="page-subtitle">
                            Real-time API monitoring from MySQL
                            <span className="subtitle-badge">
                                <Clock size={12} style={{ marginRight: '4px' }} />
                                Live
                            </span>
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-glass" onClick={handleRefresh}>
                            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="analytics-kpis">
                    <div className="analytics-kpi analytics-kpi--total">
                        <div className="analytics-kpi-icon">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p>Total Requests</p>
                            <strong>{total.toLocaleString()}</strong>
                            <div className="stat-sparkline">
                                <div className="spark-bar"></div>
                                <div className="spark-bar"></div>
                                <div className="spark-bar"></div>
                                <div className="spark-bar"></div>
                                <div className="spark-bar"></div>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-kpi analytics-kpi--success">
                        <div className="analytics-kpi-icon">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p>Success Rate</p>
                            <strong>{successRate}%</strong>
                            <div className="stat-sparkline">
                                <div className="spark-bar" style={{ background: '#10b981' }}></div>
                                <div className="spark-bar" style={{ background: '#10b981' }}></div>
                                <div className="spark-bar" style={{ background: '#10b981' }}></div>
                                <div className="spark-bar" style={{ background: '#10b981' }}></div>
                                <div className="spark-bar" style={{ background: '#10b981' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-kpi analytics-kpi--blocked">
                        <div className="analytics-kpi-icon">
                            <ShieldX size={24} />
                        </div>
                        <div>
                            <p>Blocked Rate</p>
                            <strong>{blockedRate}%</strong>
                            <div className="stat-sparkline">
                                <div className="spark-bar spark-bar--blocked"></div>
                                <div className="spark-bar spark-bar--blocked"></div>
                                <div className="spark-bar spark-bar--blocked"></div>
                                <div className="spark-bar spark-bar--blocked"></div>
                                <div className="spark-bar spark-bar--blocked"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loadError ? (
                <div className="graph-error">
                    {loadError}
                    <button onClick={handleRefresh} className="graph-error-retry">
                        Try Again
                    </button>
                </div>
            ) : null}

            {isLoading ? (
                <div className="graph-loading graph-loading--panel">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="graphs-section">
                    {/* Total Requests Graph */}
                    <div className="graph-card graph-card--total">
                        <div className="graph-header">
                            <h4 className="graph-title">
                                <LineChart size={20} />
                                Total Requests by API Key
                            </h4>
                            <div className="graph-stats">
                                <span className="graph-value">{view.summary.total.toLocaleString()}</span>
                                <span className="graph-badge graph-badge--total">
                                    {trends.total === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    Traffic
                                </span>
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
                                                left: `${view.labels.length <= 1 ? 50 : (index / (view.labels.length - 1)) * 100}%`,
                                                bottom: `${(value / view.maxValue) * 100}%`
                                            }}
                                        >
                                            <div className="point-tooltip">
                                                <strong>{view.labels[index]}</strong>
                                                <br />
                                                Requests: {value.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="x-axis">
                                    {view.labels.map((label, index) => (
                                        <div key={index} className="x-label" title={label}>
                                            {formatAxisLabel(label)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success Requests Graph */}
                    <div className="graph-card graph-card--success">
                        <div className="graph-header">
                            <h4 className="graph-title">
                                <ShieldCheck size={20} />
                                Successful Requests by API Key
                            </h4>
                            <div className="graph-stats">
                                <span className="graph-value">{view.summary.success.toLocaleString()}</span>
                                <span className="graph-badge graph-badge--success">
                                    {trends.success === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    Healthy
                                </span>
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
                                                left: `${view.labels.length <= 1 ? 50 : (index / (view.labels.length - 1)) * 100}%`,
                                                bottom: `${(value / view.maxValue) * 100}%`
                                            }}
                                        >
                                            <div className="point-tooltip">
                                                <strong>{view.labels[index]}</strong>
                                                <br />
                                                Success: {value.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="x-axis">
                                    {view.labels.map((label, index) => (
                                        <div key={index} className="x-label" title={label}>
                                            {formatAxisLabel(label)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blocked Requests Graph - Wide */}
                    <div className="graph-card analytics-card--wide graph-card--blocked">
                        <div className="graph-header">
                            <h4 className="graph-title">
                                <ShieldX size={20} />
                                Blocked Requests by API Key
                            </h4>
                            <div className="graph-stats">
                                <span className="graph-value">{view.summary.blocked.toLocaleString()}</span>
                                <span className="graph-badge graph-badge--blocked">
                                    {trends.blocked === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    Defense
                                </span>
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
                                                left: `${view.labels.length <= 1 ? 50 : (index / (view.labels.length - 1)) * 100}%`,
                                                bottom: `${(value / view.maxValue) * 100}%`
                                            }}
                                        >
                                            <div className="point-tooltip">
                                                <strong>{view.labels[index]}</strong>
                                                <br />
                                                Blocked: {value.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="x-axis">
                                    {view.labels.map((label, index) => (
                                        <div key={index} className="x-label" title={label}>
                                            {formatAxisLabel(label)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add a small spinning animation for refresh */}
            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Analytics;
