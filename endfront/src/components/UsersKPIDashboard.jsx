import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function UsersKPIDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    editorUsers: 0,
    regularUsers: 0,
    chartData: [],
    roleDistribution: []
  });

  const [filters, setFilters] = useState({
    role: 'all',
    timeRange: 'this_month',
    chartType: 'line'
  });

  const [loading, setLoading] = useState(true);

  // Fetch KPI data from backend
  const fetchKPIData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.role !== 'all') params.append('role', filters.role);
      params.append('time_range', filters.timeRange);

      const res = await axios.get(
        `http://localhost:8000/api/users/kpi?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch KPI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const previousTotal = stats.previousTotal || 0;
  const changePercent = calculateChange(stats.totalUsers, previousTotal);
  const isPositive = changePercent >= 0;

  // Colors for pie chart
  const COLORS = {
    admin: '#dc2626',
    editor: '#f59e0b',
    user: '#3b82f6'
  };

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: '12px', 
      padding: '24px',
      marginBottom: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header with Filters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937', fontWeight: '600' }}>
            Users Overview
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Monitor user activity and role distribution
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>

          {/* Time Range Filter */}
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>

          {/* Chart Type Toggle */}
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '4px',
            backgroundColor: '#f9fafb'
          }}>
            <button
              onClick={() => handleFilterChange('chartType', 'line')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                backgroundColor: filters.chartType === 'line' ? '#2196F3' : 'transparent',
                color: filters.chartType === 'line' ? '#fff' : '#6b7280',
                fontWeight: filters.chartType === 'line' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              Line
            </button>
            <button
              onClick={() => handleFilterChange('chartType', 'bar')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                backgroundColor: filters.chartType === 'bar' ? '#2196F3' : 'transparent',
                color: filters.chartType === 'bar' ? '#fff' : '#6b7280',
                fontWeight: filters.chartType === 'bar' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Total Users Card */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>
                TOTAL USERS
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '13px',
                  color: isPositive ? '#16a34a' : '#dc2626',
                  fontWeight: '600'
                }}>
                  <span>{isPositive ? '▲' : '▼'}</span>
                  <span>{Math.abs(changePercent)}%</span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>
                vs previous period
              </div>
            </div>

            {/* Admin Users Card */}
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
                ADMINS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#b91c1c' }}>
                {stats.adminUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                {stats.totalUsers > 0 ? ((stats.adminUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>

            {/* Editor Users Card */}
            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #fdba74',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#ea580c', fontWeight: '600', marginBottom: '8px' }}>
                EDITORS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#c2410c' }}>
                {stats.editorUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#ea580c', marginTop: '4px' }}>
                {stats.totalUsers > 0 ? ((stats.editorUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>

            {/* Regular Users Card */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' }}>
                USERS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#15803d' }}>
                {stats.regularUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                {stats.totalUsers > 0 ? ((stats.regularUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr',
            gap: '20px'
          }}>
            {/* Line/Bar Chart */}
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '16px', 
                color: '#374151',
                fontWeight: '600'
              }}>
                User Growth Over Time
              </h3>
              
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  {filters.chartType === 'line' ? (
                    <LineChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#2196F3" 
                        strokeWidth={2}
                        dot={{ fill: '#2196F3', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Users"
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey="users" 
                        fill="#2196F3"
                        radius={[8, 8, 0, 0]}
                        name="Users"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px', 
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  No data available
                </div>
              )}
            </div>

            {/* Pie Chart - Role Distribution */}
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '16px', 
                color: '#374151',
                fontWeight: '600'
              }}>
                Role Distribution
              </h3>
              
              {stats.roleDistribution && stats.roleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px', 
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  No data available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}