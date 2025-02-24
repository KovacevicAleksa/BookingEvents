import React, { useState, useEffect } from "react";

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [banDuration, setBanDuration] = useState("24h");
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedReport?.email) {
      fetchAccountInfo(selectedReport.email);
    }
  }, [selectedReport]);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8081/report", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchAccountInfo = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8081/admin/accounts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const accounts = await response.json();
      const account = accounts.find(acc => acc.email === email);
      setAccountInfo(account);
    } catch (error) {
      console.error("Error fetching account info:", error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedReport || !accountInfo) return;
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (banDuration === "permanent") {
        // Handle permanent ban by deleting the account
        const deleteResponse = await fetch(`http://localhost:8081/delete/users/${accountInfo._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });

        if (!deleteResponse.ok) throw new Error("Failed to delete user");
      } else {
        // Handle temporary ban
        const banDate = new Date();
        const hours = parseInt(banDuration);
        banDate.setHours(banDate.getHours() + hours);

        const banResponse = await fetch(`http://localhost:8081/admin/update/ban/${accountInfo._id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            banDate: banDate.toISOString()
          })
        });

        if (!banResponse.ok) throw new Error("Failed to ban user");
      }

      await fetchReports();
      if (banDuration !== "permanent") {
        await fetchAccountInfo(selectedReport.email);
      } else {
        setSelectedReport(null);
        setAccountInfo(null);
      }
    } catch (error) {
      console.error("Error managing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8081/report/${selectedReport._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      // Remove deleted report from state
      setReports(reports.filter(report => report._id !== selectedReport._id));
      setSelectedReport(null);
      setAccountInfo(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      setError("Failed to delete report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingBanTime = (banDate) => {
    if (!banDate) return null;
    const now = new Date();
    const ban = new Date(banDate);
    if (ban <= now) return null;
    
    const diff = ban - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  return (
    <div className="flex w-full min-h-screen bg-[#121212]">
      {/* Left Sidebar */}
      <aside className="w-1/4 bg-[#1e1e1e] p-4 border-r border-[#2a2a2a]">
        {selectedReport ? (
          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-white">User Info</h3>
            <div className="space-y-2 mb-4">
              <p className="text-white"><strong>Email:</strong> {selectedReport.email}</p>
              <p className="text-white"><strong>Status:</strong> {selectedReport.status}</p>
              
              {/* Ban Information Section */}
              <div className="mt-4 p-4 bg-[#3a3a3a] rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-red-500 font-bold mr-2">Ban Status</span>
                  <div className={`w-2 h-2 rounded-full ${accountInfo?.banDate && new Date(accountInfo.banDate) > new Date() ? 'bg-red-500' : 'bg-green-500'}`} />
                </div>
                <p className="text-gray-300">
                  <strong>Total Bans:</strong> {accountInfo?.banCount || 0}
                </p>
                {accountInfo?.banDate && new Date(accountInfo.banDate) > new Date() && (
                  <div className="mt-2">
                    <p className="text-red-400">
                      <strong>Currently Banned</strong>
                    </p>
                    <p className="text-gray-300 text-sm">
                      {getRemainingBanTime(accountInfo.banDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ban Controls */}
            <div className="mt-6 p-4 bg-[#3a3a3a] rounded-lg">
              <h4 className="text-white font-bold mb-3">Ban User</h4>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full p-2 mb-3 bg-[#2a2a2a] text-white border border-[#444] rounded"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="48h">48 Hours</option>
                <option value="72h">72 Hours</option>
                <option value="168h">1 Week</option>
                <option value="720h">30 Days</option>
                <option value="permanent">Permanent Ban (Delete Account)</option>
              </select>
              <button
                onClick={handleBanUser}
                disabled={isLoading}
                className={`w-full p-2 ${banDuration === "permanent" ? 'bg-red-800' : 'bg-red-600'} text-white rounded hover:bg-red-700 disabled:opacity-50`}
              >
                {isLoading ? "Processing..." : banDuration === "permanent" ? "Permanently Ban & Delete" : "Ban User"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Select a report to view user info</p>
        )}
      </aside>

      {/* Middle Section - Reports List */}
      <section className="w-1/2 p-4 border-r border-[#2a2a2a]">
        <h2 className="text-xl font-bold mb-4 text-white">
          Reports ({reports.length})
        </h2>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => setSelectedReport(report)}
              className={`p-3 rounded cursor-pointer ${
                selectedReport?._id === report._id ? 'bg-[#3a3a3a]' : 'bg-[#2a2a2a]'
              }`}
            >
              <h3 className="text-white font-bold">{report.category}</h3>
              <p className="text-sm text-gray-300 mt-1">
                Reported by: {report.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Status: {report.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Right Section - Report Details */}
      <aside className="w-1/4 bg-[#1e1e1e] p-4">
        {selectedReport ? (
          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-white">Report Details</h3>
            <p className="mb-2 text-white">
              <strong>Category:</strong> {selectedReport.category}
            </p>
            <p className="mb-2 text-white">
              <strong>Status:</strong> {selectedReport.status}
            </p>
            <p className="mb-2 text-white">
              <strong>Reported By:</strong> {selectedReport.email}
            </p>
            <p className="mb-2 text-white">
              <strong>Report Text:</strong>
            </p>
            <p className="text-gray-300 whitespace-pre-wrap">
              {selectedReport.reportText}
            </p>
            
            {/* Delete Report Button */}
            <div className="mt-6">
              <button
                onClick={handleDeleteReport}
                disabled={isLoading}
                className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Delete Report"}
              </button>
              {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Select a report to view details</p>
        )}
      </aside>
    </div>
  );
}