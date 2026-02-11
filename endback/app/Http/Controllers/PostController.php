<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PostController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Store (Create a New Post)
    |--------------------------------------------------------------------------
    | Called when React sends POST /api/create-new
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
    | Index (Get All Posts)
    |--------------------------------------------------------------------------
    | Called when React sends GET /api/posts
    */
    public function index()
    {
        try {
            $posts = Post::orderBy('created_at', 'desc')->get();
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
    | Show (Get Single Post)
    |--------------------------------------------------------------------------
    | Called when React sends GET /api/posts/{id}
    */
    public function show($id)
    {
        // findOrFail automatically returns 404 if not found
        $post = Post::findOrFail($id);
        return response()->json($post);
    }

    /*
    |--------------------------------------------------------------------------
    | Update (Edit Post)
    |--------------------------------------------------------------------------
    | Called when React sends PUT /api/posts/{id}
    */
    public function update(Request $request, $id)
    {
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
        
        // Update database row with validated data
        $post->update($validated);

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy (Delete Post)
    |--------------------------------------------------------------------------
    | Called when React sends DELETE /api/posts/{id}
    */
    public function destroy($id)
    {
        // Find post or throw 404
        $post = Post::findOrFail($id);

        // Delete from database (soft delete)
        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully'
        ]);
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
}