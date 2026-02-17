<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\ActivityLog;


class AuthController extends Controller
{
    /**
     * Register New User
     * VALIDATION MOVED FROM FRONTEND
     */
    public function register(Request $request)
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
                'role' => 'nullable|in:user,editor,admin'
            ], [
                'name.required' => 'Please enter your name',
                'name.min' => 'Name must be at least 2 characters long',
                'name.regex' => 'Name can only contain letters, spaces, hyphens, and apostrophes. No numbers or special characters allowed.',
                'email.required' => 'Please enter your email address',
                'email.email' => 'Please enter a valid email address (e.g., user@example.com)',
                'email.unique' => 'This email is already registered. Please use a different email or try logging in.',
                'password.required' => 'Please enter a password',
                'password.min' => 'Password must be at least 6 characters long'
            ]);

            // Set default role if not provided
            $validated['role'] = $validated['role'] ?? 'user';

            // Hash password
            $validated['password'] = Hash::make($validated['password']);

            // Create user
            $user = User::create($validated);

            // Generate JWT token
            $token = JWTAuth::fromUser($user);

            // LOG REGISTRATION ACTIVITY
            ActivityLog::logAuth('registered', $user, [
                'email' => $user->email,
                'role' => $user->role
            ]);

            return response()->json([
                'message' => 'Registration successful!',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Registration error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login User
     * VALIDATION MOVED FROM FRONTEND
     */
    public function login(Request $request)
    {
        try {
            // BACKEND VALIDATION (moved from frontend)
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6'
            ], [
                'email.required' => 'Please enter your email address',
                'email.email' => 'Please enter a valid email address',
                'password.required' => 'Please enter your password',
                'password.min' => 'Password must be at least 6 characters'
            ]);

            // Check if user exists
            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Account not found. Please check your email or register.'
                ], 404);
            }

            // Attempt to create token
            if (!$token = JWTAuth::attempt($validated)) {
                // LOG FAILED LOGIN ATTEMPT
                ActivityLog::logAuth('login_failed', null, [
                    'email' => $request->email,
                    'reason' => 'Invalid credentials'
                ]);
                return response()->json([
                    'message' => 'Invalid email or password. Please try again.'
                ], 401);
            }
            
            // LOG SUCCESSFUL LOGIN
            ActivityLog::logAuth('login', $user);
            return response()->json([
                'message' => 'Login successful!',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Login error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Logout User
     */
    public function logout()
    {
        try {
            $user = Auth::user();

            // LOG LOGOUT
            if ($user) {
                ActivityLog::logAuth('logout', $user);
            }

            JWTAuth::invalidate(JWTAuth::getToken());
            
            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to logout'
            ], 500);
        }
    }

    /**
     * Get Authenticated User
     */
    public function me()
    {
        try {
            $user = Auth::user();
            
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to fetch user data'
            ], 500);
        }
    }

    /**
     * Reset/Forgot Password
     * VALIDATION MOVED FROM FRONTEND
     */
    public function forgotPassword(Request $request)
    {
        try {
            // BACKEND VALIDATION (moved from frontend)
            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:6|confirmed',
                'password_confirmation' => 'required'
            ], [
                'email.required' => 'Please enter your email address',
                'email.email' => 'Please enter a valid email address (e.g., user@example.com)',
                'email.exists' => 'Email not found. Please check your email or register for a new account.',
                'password.required' => 'Please enter a new password',
                'password.min' => 'Password must be at least 6 characters long',
                'password.confirmed' => 'Passwords do not match. Please make sure both passwords are identical.',
                'password_confirmation.required' => 'Please confirm your password'
            ]);

            // Find user by email
            $user = User::where('email', $validated['email'])->first();

            if (! $user) {
            // LOG FAILED PASSWORD RESET ATTEMPT
            ActivityLog::logAuth('password_reset_failed', null, [
                'email' => $request->email,
                'reason' => 'Email not found'
            ]);

            return response()->json([
                'message' => 'Email not found'
            ], 404);
        }

            // Update password
            $user->password = Hash::make($validated['password']);
            $user->save();

            // LOG PASSWORD RESET
        ActivityLog::logAuth('password_changed', $user, [
            'method' => 'forgot_password'
        ]);

            return response()->json([
                'message' => 'Password reset successfully! You can now login with your new password.'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Password reset error', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to reset password. Please try again.'
            ], 500);
        }
    }
}