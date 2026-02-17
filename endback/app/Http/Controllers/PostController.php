<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;


class PostController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Index (Get All Posts with Filters, Sorting, Pagination)
    |--------------------------------------------------------------------------
    | UPDATED: Now handles search, filter, sort, pagination FROM FRONTEND
    | UPDATED: Shows pinned posts first
    */
    public function index(Request $request)
    {
        try {
            // Start query
            $query = Post::query();

            // SEARCH LOGIC (moved from frontend)
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('author', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('category', 'LIKE', "%{$searchTerm}%");
                });
            }

            // CATEGORY FILTER (moved from frontend)
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            // STATUS FILTER (moved from frontend)
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // SORTING LOGIC (moved from frontend)
            $sortBy = $request->get('sort_by', 'date');
            $sortOrder = $request->get('sort_order', 'desc');

            // PINNED POSTS FIRST
            $query->orderBy('is_pinned', 'desc')
                  ->orderBy('pinned_at', 'desc');

            switch ($sortBy) {
                case 'title':
                    $query->orderBy('title', $sortOrder);
                    break;
                case 'author':
                    $query->orderBy('author', $sortOrder);
                    break;
                case 'date':
                default:
                    $query->orderBy('created_at', $sortOrder);
                    break;
            }

            // PAGINATION (moved from frontend)
            $perPage = $request->get('per_page', 10);
            $posts = $query->paginate($perPage);

            // Return Laravel pagination format
            return response()->json($posts);

        } catch (\Exception $e) {
            Log::error('Error fetching posts', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Filter Options (Categories and Statuses)
    |--------------------------------------------------------------------------
    | NEW: Returns unique categories and statuses for dropdowns
    */
    public function getFilters()
    {
        try {
            $categories = Post::select('category')
                ->distinct()
                ->whereNotNull('category')
                ->orderBy('category')
                ->pluck('category');

            $statuses = Post::select('status')
                ->distinct()
                ->whereNotNull('status')
                ->orderBy('status')
                ->pluck('status');

            return response()->json([
                'categories' => $categories,
                'statuses' => $statuses
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching filters', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching filters',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Store (Create a New Post)
    |--------------------------------------------------------------------------
    | Called when React sends POST /api/posts
    */
    public function store(Request $request)
    {
        Log::info('Received post creation request', $request->all());

        try {
            // Validate incoming request data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'category' => 'required|string',
                'status' => 'required|string',
                'content' => 'required|string',
            ]);

            Log::info('Validation passed', $validated);

            // Create new row in the posts table using mass assignment
            $post = Post::create($validated);
            Log::info('Post created successfully', ['id' => $post->id]);

            // LOG ACTIVITY
            ActivityLog::logPost('created', $post);

            return response()->json([
                'message' => 'Post created successfully!',
                'post' => $post
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation errors (422)
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // Any unexpected server error (500)
            Log::error('Error creating post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error creating post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Show (Get Single Post)
    |--------------------------------------------------------------------------
    | Called when React sends GET /api/posts/{id}
    */
    public function show($id)
    {
        try {
            $post = Post::findOrFail($id);
            return response()->json($post);
        } catch (\Exception $e) {
            Log::error('Error fetching post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Post not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update (Edit Post)
    |--------------------------------------------------------------------------
    | Called when React sends PUT /api/posts/{id}
    */
    public function update(Request $request, $id)
    {
        try {
            // Validate incoming data
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'category' => 'required|string',
                'status' => 'required|string',
                'content' => 'required|string',
            ]);

            // Find post or throw 404
            $post = Post::findOrFail($id);

            // Track changes for activity log
            $changes = [];
            $oldValues = [];
            $newValues = [];
            
            foreach ($validated as $key => $value) {
                if ($post->{$key} != $value) {
                    $changes[] = $key;
                    $oldValues[$key] = $post->{$key};
                    $newValues[$key] = $value;
                }
            }
            
            // Update database row with validated data
            $post->update($validated);

            return response()->json([
                'message' => 'Post updated successfully',
                'post' => $post
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error updating post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy (Delete Post)
    |--------------------------------------------------------------------------
    | Called when React sends DELETE /api/posts/{id}
    */
    public function destroy($id)
    {
        try {
            // Find post or throw 404
            $post = Post::findOrFail($id);

            // Delete from database (soft delete)
            $post->delete();

            // LOG DELETE ACTIVITY
            ActivityLog::log(
                'post.deleted',
                "Deleted post '{$post['title']}'",
                'post',
                $id,
                $post
            );

            return response()->json([
                'message' => 'Post deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error deleting post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PIN POST
     */
    public function pin($id)
    {
        try {
            $post = Post::findOrFail($id);
            
            $post->is_pinned = true;
            $post->pinned_at = now();
            $post->pinned_by = Auth::id();
            $post->save();

            // LOG PIN ACTIVITY
            ActivityLog::logPost('pinned', $post);

            return response()->json([
                'message' => 'Post pinned successfully',
                'post' => $post
            ]);
        } catch (\Exception $e) {
            Log::error('Error pinning post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error pinning post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * UNPIN POST
     */
    public function unpin($id)
    {
        try {
            $post = Post::findOrFail($id);
            
            $post->is_pinned = false;
            $post->pinned_at = null;
            $post->pinned_by = null;
            $post->save();

            // LOG UNPIN ACTIVITY
            ActivityLog::logPost('unpinned', $post);

            return response()->json([
                'message' => 'Post unpinned successfully',
                'post' => $post
            ]);
        } catch (\Exception $e) {
            Log::error('Error unpinning post', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error unpinning post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Export Posts to PDF
    |--------------------------------------------------------------------------
    | Called when Admin clicks Export button
    | GET /api/posts/export?filters...
    */
    public function exportPdf(Request $request)
    {
        try {
            // Start with base query - exclude soft deleted posts
            $query = Post::query();

            // Apply date range filter
            $dateRange = $request->input('date_range', 'all');
            
            switch ($dateRange) {
                case 'today':
                    $query->whereDate('created_at', Carbon::today());
                    break;
                
                case 'this_week':
                    $query->whereBetween('created_at', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ]);
                    break;
                
                case 'this_month':
                    $query->whereMonth('created_at', Carbon::now()->month)
                          ->whereYear('created_at', Carbon::now()->year);
                    break;
                
                case 'this_year':
                    $query->whereYear('created_at', Carbon::now()->year);
                    break;
                
                case 'custom':
                    if ($request->has('start_date')) {
                        $query->whereDate('created_at', '>=', $request->input('start_date'));
                    }
                    if ($request->has('end_date')) {
                        $query->whereDate('created_at', '<=', $request->input('end_date'));
                    }
                    break;
            }

            // Apply author filter
            if ($request->filled('author')) {
                $query->where('author', 'LIKE', '%' . $request->input('author') . '%');
            }

            // Apply category filter
            if ($request->filled('category')) {
                $query->where('category', $request->input('category'));
            }

            // Apply status filter
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            // Get filtered posts ordered by date
            $posts = $query->orderBy('created_at', 'desc')->get();

            // Prepare data for PDF
            $data = [
                'posts' => $posts,
                'total' => $posts->count(),
                'generated_at' => Carbon::now()->format('F d, Y h:i A'),
                'filters' => [
                    'date_range' => $this->formatDateRange($dateRange, $request),
                    'author' => $request->input('author', 'All'),
                    'category' => $request->input('category', 'All'),
                    'status' => $request->input('status', 'All')
                ]
            ];

            // Generate PDF
            $pdf = Pdf::loadView('exports.posts', $data);
            
            // Set paper size and orientation
            $pdf->setPaper('a4', 'landscape');

            // Generate filename with timestamp
            $filename = 'posts-export-' . Carbon::now()->format('Y-m-d-His') . '.pdf';

            // LOG EXPORT ACTIVITY
            ActivityLog::logExport('posts', [
                'date_range' => $dateRange,
                'category' => $request->input('category'),
                'status' => $request->input('status'),
                'total_records' => $posts->count()
            ]);

            // Return PDF download
            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Error exporting posts to PDF', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error exporting posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format date range for display in PDF
     */
    private function formatDateRange($dateRange, $request)
    {
        switch ($dateRange) {
            case 'today':
                return 'Today (' . Carbon::today()->format('M d, Y') . ')';
            
            case 'this_week':
                return 'This Week (' . Carbon::now()->startOfWeek()->format('M d') . ' - ' . 
                       Carbon::now()->endOfWeek()->format('M d, Y') . ')';
            
            case 'this_month':
                return Carbon::now()->format('F Y');
            
            case 'this_year':
                return Carbon::now()->format('Y');
            
            case 'custom':
                $start = $request->input('start_date') ? 
                        Carbon::parse($request->input('start_date'))->format('M d, Y') : 
                        'Beginning';
                $end = $request->input('end_date') ? 
                      Carbon::parse($request->input('end_date'))->format('M d, Y') : 
                      'Present';
                return $start . ' - ' . $end;
            
            default:
                return 'All Time';
        }
    }

/**
 * Get KPI Dashboard Data for Posts
 * GET /api/posts/kpi
 */
public function getKPI(Request $request)
{
    try {
        $query = Post::query();
        $timeRange = $request->get('time_range', 'this_month');
        
        // Apply category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Get date range
        [$startDate, $endDate, $previousStart, $previousEnd] = $this->getDateRange($timeRange);
        
        // Current period posts
        $currentQuery = clone $query;
        $currentQuery->whereBetween('created_at', [$startDate, $endDate]);
        
        // Previous period posts (for comparison)
        $previousQuery = clone $query;
        $previousQuery->whereBetween('created_at', [$previousStart, $previousEnd]);
        
        // Get counts
        $totalPosts = $currentQuery->count();
        $previousTotal = $previousQuery->count();
        
        $publishedPosts = (clone $currentQuery)->where('status', 'Published')->count();
        $draftPosts = (clone $currentQuery)->where('status', 'Draft')->count();
        $archivedPosts = (clone $currentQuery)->where('status', 'Archived')->count();
        
        // Get chart data - group by date
        $chartData = $this->getChartData($query, $startDate, $endDate, $timeRange);
        
        return response()->json([
            'totalPosts' => $totalPosts,
            'previousTotal' => $previousTotal,
            'publishedPosts' => $publishedPosts,
            'draftPosts' => $draftPosts,
            'archivedPosts' => $archivedPosts,
            'chartData' => $chartData
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error fetching KPI data', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Error fetching KPI data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get date range based on time period
 */
private function getDateRange($timeRange)
{
    switch ($timeRange) {
        case 'today':
            $start = Carbon::today();
            $end = Carbon::now();
            $prevStart = Carbon::yesterday();
            $prevEnd = Carbon::today();
            break;
            
        case 'this_week':
            $start = Carbon::now()->startOfWeek();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subWeek()->startOfWeek();
            $prevEnd = Carbon::now()->subWeek()->endOfWeek();
            break;
            
        case 'this_month':
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subMonth()->startOfMonth();
            $prevEnd = Carbon::now()->subMonth()->endOfMonth();
            break;
            
        case 'last_month':
            $start = Carbon::now()->subMonth()->startOfMonth();
            $end = Carbon::now()->subMonth()->endOfMonth();
            $prevStart = Carbon::now()->subMonths(2)->startOfMonth();
            $prevEnd = Carbon::now()->subMonths(2)->endOfMonth();
            break;
            
        case 'this_year':
            $start = Carbon::now()->startOfYear();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subYear()->startOfYear();
            $prevEnd = Carbon::now()->subYear()->endOfYear();
            break;
            
        case 'all_time':
        default:
            $start = Post::min('created_at') ?? Carbon::now()->subYear();
            $end = Carbon::now();
            $prevStart = Carbon::parse($start)->subYear();
            $prevEnd = Carbon::parse($start);
            break;
    }
    
    return [$start, $end, $prevStart, $prevEnd];
}

/**
 * Get chart data grouped by time period
 */
private function getChartData($query, $startDate, $endDate, $timeRange)
{
    $chartQuery = clone $query;
    $chartQuery->whereBetween('created_at', [$startDate, $endDate]);
    
    // Determine grouping format based on time range
    switch ($timeRange) {
        case 'today':
            // Group by hour
            $format = '%H:00';
            $sqlFormat = DB::raw("FORMAT(created_at, 'HH:00')");
            break;
            
        case 'this_week':
        case 'last_week':
            // Group by day of week
            $format = '%a';
            $sqlFormat = DB::raw("FORMAT(created_at, 'ddd')");
            break;
            
        case 'this_month':
        case 'last_month':
            // Group by day
            $format = '%b %d';
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM dd')");
            break;
            
        case 'this_year':
            // Group by month
            $format = '%b';
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM')");
            break;
            
        case 'all_time':
        default:
            // Group by month
            $format = '%b %Y';
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM yyyy')");
            break;
    }
    
    $chartData = $chartQuery
        ->selectRaw("$sqlFormat as date, COUNT(*) as posts")
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(function($item) {
            return [
                'date' => $item->date,
                'posts' => (int) $item->posts
            ];
        });
    
    return $chartData;
}

/**
 * Get KPI Dashboard Data for Posts
 * GET /api/posts/kpi
 */
public function getKPIData(Request $request)
{
    try {
        $query = Post::query();
        $timeRange = $request->get('time_range', 'this_month');
        
        // Apply category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Get date range - RENAMED to avoid conflict with PDF export
        [$startDate, $endDate, $previousStart, $previousEnd] = $this->getKPIDateRange($timeRange);
        
        // Current period posts
        $currentQuery = clone $query;
        $currentQuery->whereBetween('created_at', [$startDate, $endDate]);
        
        // Previous period posts (for comparison)
        $previousQuery = clone $query;
        $previousQuery->whereBetween('created_at', [$previousStart, $previousEnd]);
        
        // Get counts
        $totalPosts = $currentQuery->count();
        $previousTotal = $previousQuery->count();
        
        $publishedPosts = (clone $currentQuery)->where('status', 'Published')->count();
        $draftPosts = (clone $currentQuery)->where('status', 'Draft')->count();
        $archivedPosts = (clone $currentQuery)->where('status', 'Archived')->count();
        
        // Get chart data - RENAMED to avoid conflict with PDF export
        $chartData = $this->getKPIChartData($query, $startDate, $endDate, $timeRange);
        
        return response()->json([
            'totalPosts' => $totalPosts,
            'previousTotal' => $previousTotal,
            'publishedPosts' => $publishedPosts,
            'draftPosts' => $draftPosts,
            'archivedPosts' => $archivedPosts,
            'chartData' => $chartData
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error fetching KPI data', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Error fetching KPI data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get date range for KPI (NOT for PDF export)
 * RENAMED to getKPIDateRange to avoid conflict
 */
private function getKPIDateRange($timeRange)
{
    switch ($timeRange) {
        case 'today':
            $start = Carbon::today();
            $end = Carbon::now();
            $prevStart = Carbon::yesterday();
            $prevEnd = Carbon::today();
            break;
            
        case 'this_week':
            $start = Carbon::now()->startOfWeek();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subWeek()->startOfWeek();
            $prevEnd = Carbon::now()->subWeek()->endOfWeek();
            break;
            
        case 'this_month':
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subMonth()->startOfMonth();
            $prevEnd = Carbon::now()->subMonth()->endOfMonth();
            break;
            
        case 'last_month':
            $start = Carbon::now()->subMonth()->startOfMonth();
            $end = Carbon::now()->subMonth()->endOfMonth();
            $prevStart = Carbon::now()->subMonths(2)->startOfMonth();
            $prevEnd = Carbon::now()->subMonths(2)->endOfMonth();
            break;
            
        case 'this_year':
            $start = Carbon::now()->startOfYear();
            $end = Carbon::now();
            $prevStart = Carbon::now()->subYear()->startOfYear();
            $prevEnd = Carbon::now()->subYear()->endOfYear();
            break;
            
        case 'all_time':
        default:
            $start = Post::min('created_at') ?? Carbon::now()->subYear();
            $end = Carbon::now();
            $prevStart = Carbon::parse($start)->subYear();
            $prevEnd = Carbon::parse($start);
            break;
    }
    
    return [$start, $end, $prevStart, $prevEnd];
}

/**
 * Get chart data for KPI (NOT for PDF export)
 * RENAMED to getKPIChartData to avoid conflict
 */
private function getKPIChartData($query, $startDate, $endDate, $timeRange)
{
    $chartQuery = clone $query;
    $chartQuery->whereBetween('created_at', [$startDate, $endDate]);

    switch ($timeRange) {
        case 'today':
            $format = "FORMAT(created_at, 'HH:00')";
            break;

        case 'this_week':
        case 'last_week':
            $format = "FORMAT(created_at, 'ddd')";
            break;

        case 'this_month':
        case 'last_month':
            $format = "FORMAT(created_at, 'MMM dd')";
            break;

        case 'this_year':
            $format = "FORMAT(created_at, 'MMM')";
            break;

        case 'all_time':
        default:
            $format = "FORMAT(created_at, 'MMM yyyy')";
            break;
    }

    $chartData = $chartQuery
        ->selectRaw("$format as date, COUNT(*) as posts")
        ->groupByRaw($format)   // ✅ correct for SQL Server
        ->orderByRaw($format)   // ✅ correct for SQL Server
        ->get()
        ->map(function($item) {
            return [
                'date' => $item->date,
                'posts' => (int) $item->posts
            ];
        });

    return $chartData;
}
}