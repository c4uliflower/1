<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{

        use SoftDeletes;
    
    /*
    |--------------------------------------------------------------------------
    | Mass Assignable Fields
    |--------------------------------------------------------------------------
    | These fields are allowed to be filled using Post::create()
    | This protects against mass assignment vulnerabilities
    */
    protected $fillable = [
        'title',
        'author',
        'category',
        'status',
        'content',
        'is_pinned',
        'pinned_at',
        'pinned_by',
    ];
    
    /*
    |--------------------------------------------------------------------------
    | Attribute Casting
    |--------------------------------------------------------------------------
    | Automatically converts timestamps into Carbon date objects
    */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'pinned_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    /**
     * Scope to get pinned posts first
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true)
            ->orderBy('pinned_at', 'desc');
    }

    /**
     * Get user who pinned this post
     */
    public function pinnedBy()
    {
        return $this->belongsTo(User::class, 'pinned_by');
    }
}
