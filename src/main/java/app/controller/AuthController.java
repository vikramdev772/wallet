package app.controller;

import app.dto.LoginRequest;
import app.dto.SignupRequest;
import app.model.User;
import app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Simple auth — no JWT, no tokens. Just signup and login. Returns the userId
 * directly.
 *
 * ⚠️ THIS IS INTENTIONALLY VULNERABLE for teaching purposes! The server trusts
 * the client to send the correct userId.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Create a new account with 100 starting balance.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            User user = userService.registerUser(
                    request.getName(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of(
                    "message", "Account created!",
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Log in with email + password. Returns user info including userId.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful!",
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
