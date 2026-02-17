<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    // Admin can export posts as PDF (Admin route)
    Route::get('/posts/export', [PostController::class, 'exportPdf']);

// User routes
Route::get('/users/kpi', [UserController::class, 'getKPIData']);
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Activity log routes
Route::get('/activity-logs', [ActivityLogController::class, 'index']);
Route::get('/activity-logs/stats', [ActivityLogController::class, 'getStats']);
Route::get('/activity-logs/recent', [ActivityLogController::class, 'getRecent']);
Route::get('/activity-logs/{type}/{id}', [ActivityLogController::class, 'getForSubject']);
Route::delete('/activity-logs/cleanup', [ActivityLogController::class, 'cleanup']);

// Post routes
Route::get('/posts/kpi', [PostController::class, 'getKPIData']);
Route::get('/posts/filters/options', [PostController::class, 'getFilters']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::post('/posts', [PostController::class, 'store']);
Route::put('/posts/{id}', [PostController::class, 'update']);
Route::delete('/posts/{id}', [PostController::class, 'destroy']);
Route::post('/posts/{id}/pin', [PostController::class, 'pin']);
Route::post('/posts/{id}/unpin', [PostController::class, 'unpin']);


// Protected
Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
