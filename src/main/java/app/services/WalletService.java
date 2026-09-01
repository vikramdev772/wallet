package app.services;

import app.model.User;
import app.model.Wallet;
import app.repo.UserRepository;
import app.repo.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Simple wallet service — no auth, no retry, just transfer logic.
 */
@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user ID: " + userId));
    }

    /** Transfer money from sender to recipient. */
    @Transactional
    public Wallet sendMoney(Long senderUserId, String recipientEmail, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero!");
        }

        Wallet senderWallet = getWalletByUserId(senderUserId);

        if (senderWallet.getUser().getEmail().equalsIgnoreCase(recipientEmail.trim())) {
            throw new IllegalArgumentException("Cannot send money to yourself!");
        }

        User recipient = userRepository.findByEmail(recipientEmail.trim())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found: " + recipientEmail));

        Wallet recipientWallet = walletRepository.findByUser(recipient)
                .orElseThrow(() -> new IllegalArgumentException("Recipient wallet not found!"));

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance!");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(amount));
        recipientWallet.setBalance(recipientWallet.getBalance().add(amount));

        walletRepository.save(recipientWallet);
        return walletRepository.save(senderWallet);
    }
}
