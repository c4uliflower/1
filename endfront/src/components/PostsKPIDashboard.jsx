import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function PostsKPIDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    archivedPosts: 0,
    chartData: []
  });

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    timeRange: 'this_month',
    chartType: 'line'
  });

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Fetch KPI data from backend
  const fetchKPIData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('time_range', filters.timeRange);

      const res = await axios.get(
        `http://localhost:8000/api/posts/kpi?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch KPI data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/posts/filters/options');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const previousTotal = stats.previousTotal || 0;
  const changePercent = calculateChange(stats.totalPosts, previousTotal);
  const isPositive = changePercent >= 0;

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
            Posts Overview
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Track your content performance and trends
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
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
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
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
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
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
                backgroundColor: filters.chartType === 'line' ? '#4CAF50' : 'transparent',
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
                backgroundColor: filters.chartType === 'bar' ? '#4CAF50' : 'transparent',
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
            {/* Total Posts Card */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' }}>
                TOTAL POSTS
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#15803d' }}>
                  {stats.totalPosts.toLocaleString()}
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
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                vs previous period
              </div>
            </div>

            {/* Published Posts Card */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>
                PUBLISHED
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e40af' }}>
                {stats.publishedPosts.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>
                {stats.totalPosts > 0 ? ((stats.publishedPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
              </div>
            </div>

            {/* Draft Posts Card */}
            <div style={{
              backgroundColor: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#ca8a04', fontWeight: '600', marginBottom: '8px' }}>
                DRAFTS
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#a16207' }}>
                {stats.draftPosts.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#ca8a04', marginTop: '4px' }}>
                {stats.totalPosts > 0 ? ((stats.draftPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
              </div>
            </div>

            {/* Archived Posts Card */}
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
                ARCHIVED
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#b91c1c' }}>
                {stats.archivedPosts.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                {stats.totalPosts > 0 ? ((stats.archivedPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>

          {/* Chart */}
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
              Posts Over Time
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
                      dataKey="posts" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      dot={{ fill: '#4CAF50', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Posts"
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
                      dataKey="posts" 
                      fill="#4CAF50"
                      radius={[8, 8, 0, 0]}
                      name="Posts"
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
                No data available for the selected filters
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}