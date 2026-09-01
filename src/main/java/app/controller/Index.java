package app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/")
public class Index {

    @GetMapping
    public Map<String, String> status() {
        return Map.of(
                "status", "running",
                "message", "Crypto Wallet API is healthy"
        );
    }
}
