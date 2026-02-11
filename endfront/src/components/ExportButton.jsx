import { useState } from "react";

export default function ExportButton() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Export options
  const [exportFilters, setExportFilters] = useState({
    dateRange: "all", // all, today, this_week, this_month, this_year, custom
    customStartDate: "",
    customEndDate: "",
    author: "",
    category: "",
    status: ""
  });

  const handleExport = () => {
        const params = new URLSearchParams();

        if (exportFilters.dateRange !== "all") {
            params.append("date_range", exportFilters.dateRange);
        }

        if (exportFilters.dateRange === "custom") {
            if (exportFilters.customStartDate) {
            params.append("start_date", exportFilters.customStartDate);
            }
            if (exportFilters.customEndDate) {
            params.append("end_date", exportFilters.customEndDate);
            }
        }

        if (exportFilters.author) {
            params.append("author", exportFilters.author);
        }

        if (exportFilters.category) {
            params.append("category", exportFilters.category);
        }

        if (exportFilters.status) {
            params.append("status", exportFilters.status);
        }

        window.open(
            `http://localhost:8000/api/posts/export?${params.toString()}`,
            "_blank"
        );

        setShowExportModal(false);
        };


  return (
    <>
      <button
        onClick={() => setShowExportModal(true)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#FF9800",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        📄 Export to PDF
      </button>

      {/* Export Options Modal */}
      {showExportModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, color: "#333" }}>Export Posts to PDF</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              Select filters to customize your export
            </p>

            {/* Date Range Filter */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                Date Range:
              </label>
              <select
                value={exportFilters.dateRange}
                onChange={(e) => setExportFilters({ ...exportFilters, dateRange: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {exportFilters.dateRange === "custom" && (
              <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={exportFilters.customStartDate}
                    onChange={(e) => setExportFilters({ ...exportFilters, customStartDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>
                    End Date:
                  </label>
                  <input
                    type="date"
                    value={exportFilters.customEndDate}
                    onChange={(e) => setExportFilters({ ...exportFilters, customEndDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Author Filter */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                Author (Optional):
              </label>
              <input
                type="text"
                placeholder="Filter by author name"
                value={exportFilters.author}
                onChange={(e) => setExportFilters({ ...exportFilters, author: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                Category (Optional):
              </label>
              <select
                value={exportFilters.category}
                onChange={(e) => setExportFilters({ ...exportFilters, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
              >
                <option value="">All Categories</option>
                <option value="Blog">Blog</option>
                <option value="News">News</option>
                <option value="Tech">Tech</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Infographics">Infographics</option>
                <option value="Opinion">Opinion</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                Status (Optional):
              </label>
              <select
                value={exportFilters.status}
                onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
              >
                <option value="">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: isExporting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: isExporting ? "#ccc" : "#9C27B0",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                {isExporting ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}