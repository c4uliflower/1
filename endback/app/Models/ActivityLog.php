<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    const UPDATED_AT = null; // We only need created_at

    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime'
    ];

    /**
     * Relationship to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Main logging method - logs any activity
     */
    public static function log($action, $description, $subjectType = null, $subjectId = null, $properties = [])
    {
        $user = auth('api')->user();

        return self::create([
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : 'System',
            'user_role' => $user ? $user->role : 'system',
            'action' => $action,
            'description' => $description,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    /**
     * Log post activity
     */
    public static function logPost($action, $post, $additionalData = [])
    {
        $actionDescriptions = [
            'created' => 'created post',
            'updated' => 'updated post',
            'deleted' => 'deleted post',
            'restored' => 'restored post',
            'published' => 'published post',
            'unpublished' => 'unpublished post',
            'pinned' => 'pinned post',
            'unpinned' => 'unpinned post',
            'scheduled' => 'scheduled post',
            'auto_published' => 'auto-published post'
        ];

        $description = ($actionDescriptions[$action] ?? $action) . " '{$post->title}'";

        return self::log(
            "post.{$action}",
            $description,
            'post',
            $post->id,
            array_merge([
                'title' => $post->title,
                'category' => $post->category,
                'status' => $post->status
            ], $additionalData)
        );
    }

    /**
     * Log user activity
     */
    public static function logUser($action, $targetUser, $additionalData = [])
    {
        $actionDescriptions = [
            'created' => 'created user account for',
            'updated' => 'updated user',
            'deleted' => 'deleted user',
            'role_changed' => 'changed role for user',
            'password_reset' => 'reset password for user'
        ];

        $description = ($actionDescriptions[$action] ?? $action) . " '{$targetUser->name}'";

        return self::log(
            "user.{$action}",
            $description,
            'user',
            $targetUser->id,
            array_merge([
                'user_email' => $targetUser->email,
                'user_role' => $targetUser->role
            ], $additionalData)
        );
    }

    /**
     * Log authentication activity
     */
    public static function logAuth($action, $user = null, $additionalData = [])
    {
        $actionDescriptions = [
            'registered' => 'registered a new account',
            'login' => 'logged in',
            'login_failed' => 'failed login attempt',
            'logout' => 'logged out',
            'password_changed' => 'changed their password',
            'password_reset_requested' => 'requested password reset'
        ];

        $userName = $user ? $user->name : ($additionalData['email'] ?? 'Unknown');
        $description = ($user ? $userName : 'Someone') . ' ' . $actionDescriptions[$action];

        return self::create([
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : null,
            'user_role' => $user ? $user->role : null,
            'action' => "auth.{$action}",
            'description' => $description,
            'subject_type' => 'auth',
            'subject_id' => $user ? $user->id : null,
            'properties' => $additionalData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    /**
     * Log export activity
     */
    public static function logExport($type, $filters = [])
    {
        return self::log(
            'system.export',
            "Exported {$type} data to PDF",
            'export',
            null,
            ['export_type' => $type, 'filters' => $filters]
        );
    }

    /**
     * Get activity for a specific subject
     */
    public static function getForSubject($type, $id)
    {
        return self::where('subject_type', $type)
            ->where('subject_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get recent activity
     */
    public static function getRecent($limit = 50)
    {
        return self::orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Get activity by action type
     */
    public static function getByAction($action, $limit = 100)
    {
        return self::where('action', 'LIKE', "%{$action}%")
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Get user's activity history
     */
    public static function getUserActivity($userId, $limit = 100)
    {
        return self::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Clean old logs (optional - for maintenance)
     */
    public static function cleanOldLogs($daysToKeep = 90)
    {
        return self::where('created_at', '<', now()->subDays($daysToKeep))
            ->delete();
    }
}