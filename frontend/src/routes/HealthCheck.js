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
  BarChart,
  Bar,
} from "recharts";
import config from "../config/config";

function HealthCheckDashboard() {
  const { user } = useAuth();
  const MAX_HISTORY_POINTS = 20;

  const [healthStatus, setHealthStatus] = useState({
    accounts: { status: "pending", responseTime: null, lastChecked: null, error: null },
    events: { status: "pending", responseTime: null, lastChecked: null, error: null },
    tickets: { status: "pending", responseTime: null, lastChecked: null, error: null },
    postgresql: { status: "pending", responseTime: null, lastChecked: null, error: null },
    redis: { status: "pending", responseTime: null, lastChecked: null, error: null },
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);

  const serviceColors = {
    accounts: "#8884d8",
    events: "#82ca9d",
    tickets: "#36a2eb",
    postgresql: "#ffc658",
    redis: "#ff6384",
  };

  const checkEndpoint = useCallback(
    async (endpoint, type) => {
      const startTime = performance.now();
      try {
        const response = await fetch(`${config.api.baseURL}${endpoint}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
    const [accounts, events, tickets, postgresql, redis] = await Promise.all([
      checkEndpoint("/admin/accounts", "accounts"),
      checkEndpoint("/view/events", "events"),
      checkEndpoint("/tickets", "tickets"),
      checkEndpoint("/healthcheck/pg", "postgresql"),
      checkEndpoint("/healthcheck/redis", "redis"),
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
          tickets: tickets.responseTime,
          ticketsStatus: tickets.status,
          postgresql: postgresql.responseTime,
          postgresqlStatus: postgresql.status,
          redis: redis.responseTime,
          redisStatus: redis.status,
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
          {serviceStatus.status.charAt(0).toUpperCase() + serviceStatus.status.slice(1)}
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

    return null;
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
              title="Tickets API"
              endpoint="/tickets"
              status={healthStatus.tickets}
              color={serviceColors.tickets}
            />
            <ServiceCard
              title="PostgreSQL"
              endpoint="/healthcheck/pg"
              status={healthStatus.postgresql}
              color={serviceColors.postgresql}
            />
            <ServiceCard
              title="Redis"
              endpoint="/healthcheck/redis"
              status={healthStatus.redis}
              color={serviceColors.redis}
            />
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
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* New Bar Chart Section */}
            <div className="h-96 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    ...Object.entries(serviceColors).map(([service]) => {
                      const times = performanceHistory.map((h) => h[service]).filter(Boolean);
                      return {
                        service: service.charAt(0).toUpperCase() + service.slice(1),
                        avg: times.length
                          ? Math.round(
                              times.reduce((sum, val) => sum + val, 0) / times.length
                            )
                          : 0,
                      };
                    }),
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#8884d8" name="Avg Response Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheckDashboard;
