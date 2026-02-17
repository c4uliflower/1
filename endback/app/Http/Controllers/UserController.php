<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\ActivityLog;

class UserController extends Controller
{
    /**
     * Get All Users with Search and Filter
     * MOVED FROM FRONTEND: Search and role filter logic
     */
    public function index(Request $request)
    {
        try {
            // Start query
            $query = User::query();

            // SEARCH LOGIC (moved from frontend)
            if ($request->has('search') && $request->search != '') {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });
            }

            // ROLE FILTER (moved from frontend)
            if ($request->has('role') && $request->role != '') {
                $query->where('role', $request->role);
            }

            // Order by created date (newest first)
            $users = $query->orderBy('created_at', 'desc')->get();

            return response()->json($users);

        } catch (\Exception $e) {
            Log::error('Error fetching users', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create New User
     * VALIDATION MOVED FROM FRONTEND
     */
    public function store(Request $request)
    {
        try {
            // BACKEND VALIDATION (moved from frontend)
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'min:2',
                    'max:255',
                    'regex:/^[a-zA-Z\s\'-]+$/' // Only letters, spaces, hyphens, apostrophes
                ],
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'required|in:user,editor,admin'
            ], [
                'name.regex' => 'Name can only contain letters, spaces, hyphens, and apostrophes.',
                'name.min' => 'Name must be at least 2 characters long.',
                'email.unique' => 'This email is already registered.',
                'password.min' => 'Password must be at least 6 characters long.'
            ]);

            // Hash the password
            $validated['password'] = Hash::make($validated['password']);

            $user = User::create($validated);

            // LOG USER CREATION
            ActivityLog::logUser('created', $user);

            return response()->json($user, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update User Details
     * VALIDATION MOVED FROM FRONTEND
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            // BACKEND VALIDATION (moved from frontend)
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'min:2',
                    'max:255',
                    'regex:/^[a-zA-Z\s\'-]+$/'
                ],
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users')->ignore($user->id)
                ],
                'role' => 'required|in:user,editor,admin'
            ], [
                'name.regex' => 'Name can only contain letters, spaces, hyphens, and apostrophes.',
                'name.min' => 'Name must be at least 2 characters long.',
                'email.unique' => 'This email is already taken.'
            ]);

            // Track changes
            $changes = [];
            $oldValues = [];
            $newValues = [];

            foreach ($validated as $key => $value) {
                if ($user->{$key} != $value) {
                    $changes[] = $key;
                    $oldValues[$key] = $user->{$key};
                    $newValues[$key] = $value;
                }
            }

            // Check if role changed
            if (in_array('role', $changes)) {
                // LOG ROLE CHANGE
                ActivityLog::logUser('role_changed', $user, [
                    'old_role' => $oldValues['role'],
                    'new_role' => $newValues['role']
                ]);
            }

            $user->update($validated);

            // LOG USER UPDATE
            if (!empty($changes)) {
                ActivityLog::logUser('updated', $user, [
                    'changes' => $changes,
                    'old' => $oldValues,
                    'new' => $newValues
                ]);
            }

            return response()->json($user);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error updating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft Delete User
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Get current authenticated user ID
            $currentUserId = Auth::id();
            
            // Prevent deleting yourself
            if ($currentUserId === $user->id) {
                return response()->json([
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            // Soft delete (sets deleted_at timestamp)
            $user->delete();

            // LOG USER DELETION
            ActivityLog::log(
                'user.deleted',
                "Deleted user '{$user['name']}'",
                'user',
                $id,
                $user
            );

            return response()->json([
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting user', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Get KPI Dashboard Data for Users
 * GET /api/users/kpi
 */
public function getKPI(Request $request)
{
    try {
        $query = User::query();
        $timeRange = $request->get('time_range', 'this_month');
        
        // Apply role filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        
        // Get date range
        [$startDate, $endDate, $previousStart, $previousEnd] = $this->getDateRange($timeRange);
        
        // Current period users
        $currentQuery = clone $query;
        $currentQuery->whereBetween('created_at', [$startDate, $endDate]);
        
        // Previous period users (for comparison)
        $previousQuery = clone $query;
        $previousQuery->whereBetween('created_at', [$previousStart, $previousEnd]);
        
        // Get counts
        $totalUsers = $currentQuery->count();
        $previousTotal = $previousQuery->count();
        
        // Count by role in current period
        $adminUsers = User::where('role', 'admin')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $editorUsers = User::where('role', 'editor')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $regularUsers = User::where('role', 'user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        // Get chart data - group by date
        $chartData = $this->getChartData($query, $startDate, $endDate, $timeRange);
        
        // Get role distribution (all time)
        $roleDistribution = User::select('role', DB::raw('count(*) as value'))
            ->groupBy('role')
            ->get()
            ->map(function($item) {
                return [
                    'name' => ucfirst($item->role),
                    'value' => (int) $item->value
                ];
            });
        
        return response()->json([
            'totalUsers' => $totalUsers,
            'previousTotal' => $previousTotal,
            'adminUsers' => $adminUsers,
            'editorUsers' => $editorUsers,
            'regularUsers' => $regularUsers,
            'chartData' => $chartData,
            'roleDistribution' => $roleDistribution
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error fetching user KPI data', ['error' => $e->getMessage()]);
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
            $start = User::min('created_at') ?? Carbon::now()->subYear();
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
            $sqlFormat = DB::raw("FORMAT(created_at, 'HH:00')");
            break;
            
        case 'this_week':
        case 'last_week':
            // Group by day of week
            $sqlFormat = DB::raw("FORMAT(created_at, 'ddd')");
            break;
            
        case 'this_month':
        case 'last_month':
            // Group by day
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM dd')");
            break;
            
        case 'this_year':
            // Group by month
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM')");
            break;
            
        case 'all_time':
        default:
            // Group by month
            $sqlFormat = DB::raw("FORMAT(created_at, 'MMM yyyy')");
            break;
    }
    
    $chartData = $chartQuery
        ->selectRaw("$sqlFormat as date, COUNT(*) as users")
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->map(function($item) {
            return [
                'date' => $item->date,
                'users' => (int) $item->users
            ];
        });
    
    return $chartData;
}

/**
 * Get KPI Dashboard Data for Users
 * GET /api/users/kpi
 */
public function getKPIData(Request $request)
{
    try {
        $query = User::query();
        $timeRange = $request->get('time_range', 'this_month');
        
        // Apply role filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        
        // Get date range
        [$startDate, $endDate, $previousStart, $previousEnd] = $this->getKPIDateRange($timeRange);
        
        // Current period users
        $currentQuery = clone $query;
        $currentQuery->whereBetween('created_at', [$startDate, $endDate]);
        
        // Previous period users (for comparison)
        $previousQuery = clone $query;
        $previousQuery->whereBetween('created_at', [$previousStart, $previousEnd]);
        
        // Get counts
        $totalUsers = $currentQuery->count();
        $previousTotal = $previousQuery->count();
        
        // Count by role in current period
        $adminUsers = User::where('role', 'admin')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $editorUsers = User::where('role', 'editor')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        $regularUsers = User::where('role', 'user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        // Get chart data - group by date
        $chartData = $this->getKPIChartData($query, $startDate, $endDate, $timeRange);
        
        // Get role distribution (all time)
        $roleDistribution = User::select('role', DB::raw('count(*) as value'))
            ->groupBy('role')
            ->get()
            ->map(function($item) {
                return [
                    'name' => ucfirst($item->role),
                    'value' => (int) $item->value
                ];
            });
        
        return response()->json([
            'totalUsers' => $totalUsers,
            'previousTotal' => $previousTotal,
            'adminUsers' => $adminUsers,
            'editorUsers' => $editorUsers,
            'regularUsers' => $regularUsers,
            'chartData' => $chartData,
            'roleDistribution' => $roleDistribution
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error fetching user KPI data', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Error fetching KPI data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get date range for KPI
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
            $start = User::min('created_at') ?? Carbon::now()->subYear();
            $end = Carbon::now();
            $prevStart = Carbon::parse($start)->subYear();
            $prevEnd = Carbon::parse($start);
            break;
    }
    
    return [$start, $end, $prevStart, $prevEnd];
}

/**
 * Get chart data for KPI
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
        ->selectRaw("$format as date, COUNT(*) as users")
        ->groupByRaw($format)   // ✅ correct
        ->orderByRaw($format)   // ✅ correct
        ->get()
        ->map(function($item) {
            return [
                'date' => $item->date,
                'users' => (int) $item->users
            ];
        });

    return $chartData;
}
}
