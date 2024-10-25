import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Circle } from "lucide-react";

function HealthCheck() {
  const { user } = useAuth();
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
    pgadmin: {
      status: "pending",
      responseTime: null,
      lastChecked: null,
      error: null,
    },
  });

  const checkEndpoint = useCallback(
    async (endpoint, type, baseUrl = "http://localhost:8081") => {
      const startTime = performance.now();
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            Authorization:
              type !== "pgadmin" ? `Bearer ${user.token}` : undefined,
          },
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (!response.ok && type !== "pgadmin") {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // For pgAdmin, we just check if we can reach the server
        if (type === "pgadmin") {
          setHealthStatus((prev) => ({
            ...prev,
            [type]: {
              status: "healthy",
              responseTime,
              lastChecked: new Date().toLocaleTimeString(),
              error: null,
            },
          }));
          return;
        }

        // For other endpoints, parse JSON response
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
      } catch (error) {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        // Special handling for pgAdmin - if it's a CORS error but we got a response, consider it healthy
        if (
          type === "pgadmin" &&
          error.name === "TypeError" &&
          error.message.includes("CORS")
        ) {
          setHealthStatus((prev) => ({
            ...prev,
            [type]: {
              status: "healthy",
              responseTime,
              lastChecked: new Date().toLocaleTimeString(),
              error: null,
            },
          }));
          return;
        }

        setHealthStatus((prev) => ({
          ...prev,
          [type]: {
            status: "unhealthy",
            responseTime,
            lastChecked: new Date().toLocaleTimeString(),
            error: error.message,
          },
        }));
      }
    },
    [user.token]
  );

  const checkHealth = useCallback(() => {
    checkEndpoint("/admin/accounts", "accounts");
    checkEndpoint("/view/events", "events");
    checkEndpoint("/healthcheck/pg", "postgresql");
    checkEndpoint("/", "pgadmin", "http://localhost:8082");
  }, [checkEndpoint]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
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

  const ServiceCard = ({
    title,
    endpoint,
    status,
    baseUrl = "http://localhost:8081",
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        {renderStatus(status)}
      </div>
      <div className="space-y-2">
        <p className="text-gray-600">
          Endpoint:{" "}
          <span className="font-mono">
            {baseUrl}
            {endpoint}
          </span>
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          System Health Status
        </h1>

        <div className="grid gap-6">
          <ServiceCard
            title="Accounts API"
            endpoint="/admin/accounts"
            status={healthStatus.accounts}
          />

          <ServiceCard
            title="Events API"
            endpoint="/view/events"
            status={healthStatus.events}
          />

          <ServiceCard
            title="PostgreSQL"
            endpoint="/healthcheck/pg"
            status={healthStatus.postgresql}
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
      </div>
    </div>
  );
}

export default HealthCheck;
