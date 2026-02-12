<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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

            $user->update($validated);

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
}