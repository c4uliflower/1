<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
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
        'content'
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
    ];
}