<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Log;

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

    // Delete from database
    $post->delete();

    return response()->json([
        'message' => 'Post deleted successfully'
    ]);
}

}