package app.controller;

import app.dto.SendMoneyRequest;
import app.model.Wallet;
import app.services.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Wallet operations — takes userId directly from the client.
 *
 * ⚠️ VULNERABLE BY DESIGN — this is the IDOR attack surface!
 *
 * The frontend stores the userId in localStorage after login. When the user
 * sends money, the frontend sends that userId.
 *
 * ATTACK SCENARIO: 1. Victim (userId=1) logs in → frontend stores userId=1 in
 * localStorage 2. Attacker logs in → frontend stores userId=2 in localStorage
 * 3. Attacker opens DevTools → changes localStorage userId from 2 to 1 4.
 * Attacker sends money using userId=1 → steals victim's money!
 *
 * WHY IT WORKS: The server blindly trusts the userId from the client. It never
 * checks: "Is this userId actually the logged-in user?"
 *
 * FIX: Use JWT/session tokens so the server knows WHO is making the request,
 * and never accept userId from the client.
 */
@RestController
@RequestMapping("/api/wallet")
@CrossOrigin("*")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * GET /api/wallet?userId=1 — View any wallet by changing the userId!
     */
    @GetMapping
    public ResponseEntity<?> getWallet(@RequestParam Long userId) {
        try {
            Wallet wallet = walletService.getWalletByUserId(userId);
            return ResponseEntity.ok(Map.of("wallet", wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/wallet/send — Send money using a userId from the client.
     *
     * ⚠️ ATTACK: Change userId in localStorage to someone else's ID, then send
     * money. The server will transfer FROM that user's wallet!
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@Valid @RequestBody SendMoneyRequest body,
            @RequestParam Long userId) {
        try {
            Wallet wallet = walletService.sendMoney(
                    userId, body.getRecipientEmail(), body.getAmount());
            return ResponseEntity.ok(Map.of(
                    "message", "Transfer successful!",
                    "wallet", wallet
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
