<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Posts Export</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            color: #333;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 15px;
        }
        
        .header h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            font-size: 12px;
            color: #666;
        }
        
        .filters-section {
            background-color: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .filters-section h3 {
            font-size: 12px;
            margin-bottom: 10px;
            color: #333;
        }
        
        .filters-grid {
            display: table;
            width: 100%;
        }
        
        .filter-row {
            display: table-row;
        }
        
        .filter-label {
            display: table-cell;
            font-weight: bold;
            padding: 4px 10px 4px 0;
            width: 100px;
        }
        
        .filter-value {
            display: table-cell;
            padding: 4px 0;
        }
        
        .summary {
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        .summary strong {
            color: #4CAF50;
            font-size: 14px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        thead {
            background-color: #333;
            color: white;
        }
        
        thead th {
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
        }
        
        tbody tr {
            border-bottom: 1px solid #ddd;
        }
        
        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        tbody td {
            padding: 10px 8px;
            font-size: 9px;
            vertical-align: top;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        
        .badge-category {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        
        .badge-published {
            background-color: #c8e6c9;
            color: #2e7d32;
        }
        
        .badge-draft {
            background-color: #fff9c4;
            color: #f57f17;
        }
        
        .badge-archived {
            background-color: #ffccbc;
            color: #d84315;
        }
        
        .content-preview {
            font-size: 8px;
            color: #666;
            max-width: 200px;
            word-wrap: break-word;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 8px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .no-posts {
            text-align: center;
            padding: 40px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Posts Export Report</h1>
        <div class="subtitle">Generated on {{ $generated_at }}</div>
    </div>

    <!-- Applied Filters -->
    <div class="filters-section">
        <h3>Applied Filters:</h3>
        <div class="filters-grid">
            <div class="filter-row">
                <div class="filter-label">Date Range:</div>
                <div class="filter-value">{{ $filters['date_range'] }}</div>
            </div>
            <div class="filter-row">
                <div class="filter-label">Author:</div>
                <div class="filter-value">{{ $filters['author'] }}</div>
            </div>
            <div class="filter-row">
                <div class="filter-label">Category:</div>
                <div class="filter-value">{{ $filters['category'] }}</div>
            </div>
            <div class="filter-row">
                <div class="filter-label">Status:</div>
                <div class="filter-value">{{ $filters['status'] }}</div>
            </div>
        </div>
    </div>

    <!-- Summary -->
    <div class="summary">
        Total Posts: <strong>{{ $total }}</strong>
    </div>

    <!-- Posts Table -->
    @if($posts->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 30px;">#</th>
                    <th style="width: 150px;">Title</th>
                    <th style="width: 80px;">Author</th>
                    <th style="width: 70px;">Category</th>
                    <th style="width: 60px;">Status</th>
                    <th style="width: 80px;">Created</th>
                    <th>Content Preview</th>
                </tr>
            </thead>
            <tbody>
                @foreach($posts as $index => $post)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td><strong>{{ $post->title }}</strong></td>
                        <td>{{ $post->author }}</td>
                        <td>
                            <span class="badge badge-category">{{ $post->category }}</span>
                        </td>
                        <td>
                            <span class="badge 
                                @if($post->status === 'Published') badge-published
                                @elseif($post->status === 'Draft') badge-draft
                                @else badge-archived
                                @endif">
                                {{ $post->status }}
                            </span>
                        </td>
                        <td>{{ $post->created_at->format('M d, Y') }}</td>
                        <td class="content-preview">
                            {{ Str::limit($post->content, 100) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-posts">
            No posts found matching the selected filters.
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        Bulletin - Posts Management System | Exported on {{ $generated_at }}
    </div>
</body>
</html>