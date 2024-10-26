import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Circle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function HealthCheck() {
  const { user } = useAuth();
  const MAX_HISTORY_POINTS = 20;

  const [healthStatus, setHealthStatus] = useState({
    accounts: {
      status: "pending",
      responseTime: null,
      lastChecked: null,
      error: null,
    },
    events: {
      status: "pending",
      responseTime: null,
      lastChecked: null,
      error: null,
    },
    postgresql: {
      status: "pending",
      responseTime: null,
      lastChecked: null,
      error: null,
    },
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);

  const serviceColors = {
    accounts: "#8884d8",
    events: "#82ca9d",
    postgresql: "#ffc658",
  };

  const checkEndpoint = useCallback(
    async (endpoint, type) => {
      const startTime = performance.now();
      try {
        const response = await fetch(`http://localhost:8081${endpoint}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();

        setHealthStatus((prev) => ({
          ...prev,
          [type]: {
            status: "healthy",
            responseTime,
            lastChecked: new Date().toLocaleTimeString(),
            error: null,
          },
        }));

        return { responseTime, status: "healthy" };
      } catch (error) {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        setHealthStatus((prev) => ({
          ...prev,
          [type]: {
            status: "unhealthy",
            responseTime,
            lastChecked: new Date().toLocaleTimeString(),
            error: error.message,
          },
        }));

        return { responseTime, status: "unhealthy" };
      }
    },
    [user.token]
  );

  const checkHealth = useCallback(async () => {
    const timestamp = new Date().toLocaleTimeString();
    const [accounts, events, postgresql] = await Promise.all([
      checkEndpoint("/admin/accounts", "accounts"),
      checkEndpoint("/view/events", "events"),
      checkEndpoint("/healthcheck/pg", "postgresql"),
    ]);

    setPerformanceHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          timestamp,
          accounts: accounts.responseTime,
          accountsStatus: accounts.status,
          events: events.responseTime,
          eventsStatus: events.status,
          postgresql: postgresql.responseTime,
          postgresqlStatus: postgresql.status,
        },
      ];

      return newHistory.slice(-MAX_HISTORY_POINTS);
    });
  }, [checkEndpoint]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const renderStatus = (serviceStatus) => {
    const statusColors = {
      healthy: "text-green-500",
      unhealthy: "text-red-500",
      pending: "text-gray-400",
    };

    return (
      <div className="flex items-center space-x-2">
        <Circle
          className={`fill-current ${statusColors[serviceStatus.status]}`}
          size={16}
        />
        <span className={`font-medium ${statusColors[serviceStatus.status]}`}>
          {serviceStatus.status.charAt(0).toUpperCase() +
            serviceStatus.status.slice(1)}
        </span>
      </div>
    );
  };

  const CustomizedDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const status = payload[`${dataKey}Status`];

    if (status === "unhealthy") {
      return <circle cx={cx} cy={cy} r={4} fill="red" />;
    }

    return null; // Return null for healthy status to keep the default line appearance
  };

  const ServiceCard = ({ title, endpoint, status, color }) => (
    <div
      className="bg-white p-6 rounded-lg shadow-lg"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        {renderStatus(status)}
      </div>
      <div className="space-y-2">
        <p className="text-gray-600">
          Endpoint: <span className="font-mono">{endpoint}</span>
        </p>
        <p className="text-gray-600">
          Response Time:{" "}
          {status.responseTime ? `${status.responseTime}ms` : "N/A"}
        </p>
        <p className="text-gray-600">
          Last Checked: {status.lastChecked || "Never"}
        </p>
        {status.error && (
          <p className="text-red-500 mt-2">Error: {status.error}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          System Health Status
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Cards Section */}
          <div className="space-y-6">
            <ServiceCard
              title="Accounts API"
              endpoint="/admin/accounts"
              status={healthStatus.accounts}
              color={serviceColors.accounts}
            />

            <ServiceCard
              title="Events API"
              endpoint="/view/events"
              status={healthStatus.events}
              color={serviceColors.events}
            />

            <ServiceCard
              title="PostgreSQL"
              endpoint="/healthcheck/pg"
              status={healthStatus.postgresql}
              color={serviceColors.postgresql}
            />

            <div className="flex justify-center mt-4">
              <button
                onClick={checkHealth}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
              >
                Refresh Status
              </button>
            </div>
          </div>

          {/* Performance Charts Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Response Time History
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceHistory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    label={{
                      value: "Response Time (ms)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  {Object.entries(serviceColors).map(([service, color]) => (
                    <Line
                      key={service}
                      type="monotone"
                      dataKey={service}
                      stroke={color}
                      name={`${
                        service.charAt(0).toUpperCase() + service.slice(1)
                      } API`}
                      dot={<CustomizedDot />}
                      strokeDasharray={(datum) =>
                        datum[`${service}Status`] === "unhealthy" ? "5 5" : "0"
                      }
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Object.entries(serviceColors).map(([service, color]) => {
                const times = performanceHistory
                  .map((h) => h[service])
                  .filter(Boolean);
                const avg = times.length
                  ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
                  : 0;
                const max = times.length ? Math.max(...times) : 0;

                return (
                  <div
                    key={service}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: `${color}15`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <h3 className="font-semibold capitalize mb-2">{service}</h3>
                    <div className="text-sm">
                      <p>Avg: {avg}ms</p>
                      <p>Max: {max}ms</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;
