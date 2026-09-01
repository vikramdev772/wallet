package app.controller;

import app.model.User;
import app.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * User profile — takes userId directly from the client.
 *
 * ⚠️ VULNERABLE: Server trusts the client-sent userId.
 * An attacker can change this ID to see any user's profile.
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/user/profile?userId=1
     *
     * The frontend sends the userId it "remembers" from login.
     * But the attacker can change it to any number!
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(Map.of("user", user));
    }
}
