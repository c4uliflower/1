<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    // Admin can export posts as PDF (Admin route)
    Route::get('/posts/export', [PostController::class, 'exportPdf']);

// Public
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

// Protected
Route::middleware('auth:api')->group(function () {

    // User routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Editor/Admin routes
    Route::middleware('role:editor,admin')->group(function () {
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
    });
    
    // Admin routes
    Route::middleware('role:admin')->group(function () {

        // Admin can delete posts
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    });
});