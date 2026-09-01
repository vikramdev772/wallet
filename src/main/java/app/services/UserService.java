package app.services;

import app.model.User;
import app.model.Wallet;
import app.repo.UserRepository;
import app.repo.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Simple user service — signup, login, and profile.
 * Passwords are hashed with SHA-256 before storing.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    public UserService(UserRepository userRepository, WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
    }

    /** Create a new account with 100 starting balance. */
    @Transactional
    public User registerUser(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered!");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(HashUtil.sha256(password))
                .build();

        User savedUser = userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(BigDecimal.valueOf(100))
                .build();

        walletRepository.save(wallet);
        savedUser.setWallet(wallet);

        return savedUser;
    }

    /** Verify credentials. Returns user if valid, throws if not. */
    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password!"));

        if (!user.getPassword().equals(HashUtil.sha256(password))) {
            throw new IllegalArgumentException("Invalid email or password!");
        }

        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
