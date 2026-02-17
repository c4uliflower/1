<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs with filters and pagination
     */
    public function index(Request $request)
    {
        try {
            $query = ActivityLog::with('user');

            // Filter by action
            if ($request->filled('action')) {
                $query->where('action', 'LIKE', "%{$request->action}%");
            }

            // Filter by subject type
            if ($request->filled('subject_type')) {
                $query->where('subject_type', $request->subject_type);
            }

            // Filter by user
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by date range
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sort by newest first
            $query->orderBy('created_at', 'desc');

            // Paginate
            $perPage = $request->get('per_page', 50);
            $logs = $query->paginate($perPage);

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error('Error fetching activity logs', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity logs for a specific subject (post or user)
     */
    public function getForSubject($type, $id)
    {
        try {
            $logs = ActivityLog::where('subject_type', $type)
                ->where('subject_id', $id)
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error('Error fetching subject activity', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity statistics
     */
    public function getStats(Request $request)
    {
        try {
            $timeRange = $request->get('time_range', 'today');
            
            // Determine date range
            switch ($timeRange) {
                case 'today':
                    $from = now()->startOfDay();
                    break;
                case 'week':
                    $from = now()->startOfWeek();
                    break;
                case 'month':
                    $from = now()->startOfMonth();
                    break;
                default:
                    $from = now()->subDays(30);
            }

            $stats = [
                'total_actions' => ActivityLog::where('created_at', '>=', $from)->count(),
                'posts_created' => ActivityLog::where('action', 'post.created')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'posts_updated' => ActivityLog::where('action', 'post.updated')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'posts_deleted' => ActivityLog::where('action', 'post.deleted')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'users_created' => ActivityLog::where('action', 'user.created')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'logins' => ActivityLog::where('action', 'auth.login')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'failed_logins' => ActivityLog::where('action', 'auth.login_failed')
                    ->where('created_at', '>=', $from)
                    ->count(),
                'most_active_users' => ActivityLog::select('user_name', DB::raw('count(*) as action_count'))
                    ->where('created_at', '>=', $from)
                    ->whereNotNull('user_id')
                    ->groupBy('user_name')
                    ->orderBy('action_count', 'desc')
                    ->take(5)
                    ->get()
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error fetching activity stats', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activity (for dashboard widget)
     */
    public function getRecent(Request $request)
    {
        try {
            $limit = $request->get('limit', 20);
            
            $logs = ActivityLog::with('user')
                ->orderBy('created_at', 'desc')
                ->take($limit)
                ->get();

            return response()->json($logs);

        } catch (\Exception $e) {
            Log::error('Error fetching recent activity', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching recent activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean old activity logs (Admin only - for maintenance)
     */
    public function cleanup(Request $request)
    {
        try {
            $daysToKeep = $request->get('days', 90);
            
            $deleted = ActivityLog::where('created_at', '<', now()->subDays($daysToKeep))
                ->delete();

            // LOG CLEANUP ACTIVITY
            ActivityLog::log(
                'system.cleanup',
                "Cleaned up activity logs older than {$daysToKeep} days",
                'system',
                null,
                ['deleted_count' => $deleted, 'days_kept' => $daysToKeep]
            );

            return response()->json([
                'message' => "Deleted {$deleted} old log entries",
                'deleted_count' => $deleted
            ]);

        } catch (\Exception $e) {
            Log::error('Error cleaning up logs', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error cleaning up logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}