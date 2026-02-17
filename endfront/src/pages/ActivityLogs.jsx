import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    subject_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
    per_page: 50
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      params.append('page', currentPage);

      const res = await axios.get(
        `http://localhost:8000/api/activity-logs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLogs(res.data.data);
      setTotalPages(res.data.last_page);
      
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://localhost:8000/api/activity-logs/stats?time_range=today',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Get icon for action type
  const getActionIcon = (action) => {
    if (action.includes('created')) return '➕';
    if (action.includes('updated')) return '✏️';
    if (action.includes('deleted')) return '🗑️';
    if (action.includes('login')) return '🔐';
    if (action.includes('logout')) return '🚪';
    if (action.includes('pinned')) return '📌';
    if (action.includes('scheduled')) return '⏰';
    if (action.includes('published')) return '📢';
    if (action.includes('export')) return '📄';
    return '📋';
  };

  // Get color for action type
  const getActionColor = (action) => {
    if (action.includes('created')) return '#4CAF50';
    if (action.includes('updated')) return '#FF9800';
    if (action.includes('deleted')) return '#f44336';
    if (action.includes('login')) return '#2196F3';
    if (action.includes('pinned')) return '#9C27B0';
    if (action.includes('published')) return '#4CAF50';
    return '#666';
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>📊 Activity Logs</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Monitor all system activities and user actions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to="/"
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #2196F3'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
              TOTAL ACTIONS TODAY
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {stats.total_actions}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #4CAF50'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
              POSTS CREATED
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {stats.posts_created}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #FF9800'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
              POSTS UPDATED
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {stats.posts_updated}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #2196F3'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
              LOGINS TODAY
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {stats.logins}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #f44336'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
              FAILED LOGINS
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {stats.failed_logins}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1f2937' }}>
          🔍 Filters
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Action Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Action Type
            </label>
            <input
              type="text"
              placeholder="e.g., created, login, deleted"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Subject Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Subject
            </label>
            <select
              value={filters.subject_type}
              onChange={(e) => setFilters({ ...filters, subject_type: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">All</option>
              <option value="post">Posts</option>
              <option value="user">Users</option>
              <option value="auth">Authentication</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Clear Filters Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => setFilters({
                action: '',
                subject_type: '',
                user_id: '',
                date_from: '',
                date_to: '',
                per_page: 50
              })}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
          Activity Timeline
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            Loading activity logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            No activity logs found.
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#e5e7eb'
              }} />

              {logs.map((log, index) => (
                <div key={log.id} style={{
                  position: 'relative',
                  paddingLeft: '60px',
                  paddingBottom: '24px',
                  marginBottom: index < logs.length - 1 ? '8px' : 0
                }}>
                  {/* Icon */}
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getActionColor(log.action) + '15',
                    border: `3px solid ${getActionColor(log.action)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                          {log.description}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            backgroundColor: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb'
                          }}>
                            {log.user_name || 'System'}
                          </span>
                          {log.user_role && (
                            <span style={{
                              fontSize: '11px',
                              color: '#fff',
                              backgroundColor: log.user_role === 'admin' ? '#f44336' : log.user_role === 'editor' ? '#FF9800' : '#2196F3',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {log.user_role}
                            </span>
                          )}
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {log.ip_address}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    {/* Properties (if any) */}
                    {log.properties && Object.keys(log.properties).length > 0 && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#6b7280',
                          userSelect: 'none'
                        }}>
                          View details
                        </summary>
                        <pre style={{
                          marginTop: '8px',
                          padding: '12px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          fontSize: '11px',
                          color: '#374151',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}>
                          {JSON.stringify(log.properties, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ← Previous
                </button>

                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}