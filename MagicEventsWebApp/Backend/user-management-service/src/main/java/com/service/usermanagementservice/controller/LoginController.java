package com.service.usermanagementservice.controller;

import com.service.usermanagementservice.dto.LoginWithTokenDTO;
import com.service.usermanagementservice.dto.UserDTO;
import com.service.usermanagementservice.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/login")
public class LoginController {
    private final AuthService authService;

    private String clientProtocol;

    @Value("${client.url}")
    private String clientUrl;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(
            @RequestParam("name") String name,
            @RequestParam("surname") String surname,
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password
    ) {
        return authService.registerUser(name, surname, email, password, username);
    }

    @GetMapping("/form")
    public UserDTO login(@RequestParam("email") String email, @RequestParam("password") String password) {
        return authService.login(email, password);
    }

    @PostMapping("/generateresetpasswordlink")
    public String generateResetPasswordLink(@RequestParam String email) {
        return authService.initiateResetPasswordLink(email);
    }

    @PutMapping("/changepassword")
    public String changePassword(@RequestParam("token") String token, @RequestParam("new_password") String newPassword) {
        return authService.changePasswordWithToken(token, newPassword);
    }

    @GetMapping("/userprofile")
    public UserDTO getUserInfo(@RequestParam("accessToken") String accessToken) {
        return authService.getUserInfo(accessToken);
    }

    @GetMapping("/helloserver")
    public void identifyClientProtocol(@RequestParam("protocol") String protocol) {
        this.clientProtocol = protocol;
    }

    @GetMapping("/grantcode")
    public void grantCode(@RequestParam("code") String code, HttpServletRequest request, HttpServletResponse response) throws IOException {
        LoginWithTokenDTO oauthToken = authService.processGrantCode(code);
        String redirectUrl = this.clientProtocol + "://" + clientUrl + "/googlecallback?accessToken=" + oauthToken.getAccessToken();
        response.sendRedirect(redirectUrl);
    }
}
