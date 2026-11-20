package com.example.demo.filter;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebFilter(urlPatterns = {"/api/*", "/admin/*"})
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    private final AuthService authService;
    private final UserRepository userRepository;

    private static final String ALLOWED_ORIGIN = "http://localhost:5174";

    private static final String[] PUBLIC_EXACT_PATHS = {
        "/api/users/register",
        "/api/auth/login"
    };

    public AuthenticationFilter(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            executeFilterLogic(request, response, chain);
        } catch (Exception e) {
            logger.error("Unexpected error in AuthenticationFilter", e);
            sendErrorResponse((HttpServletResponse) response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Internal server error: " + e.getMessage());
        }
    }

    private void executeFilterLogic(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Apply CORS headers to all responses
        setCORSHeaders(httpResponse);

        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // Handle preflight (OPTIONS) requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Check if path is public
        boolean isPublicPath = Arrays.asList(PUBLIC_EXACT_PATHS).contains(requestURI)
                || ("GET".equalsIgnoreCase(method) && requestURI.startsWith("/api/products"))
                || ("GET".equalsIgnoreCase(method) && requestURI.startsWith("/api/categories"));

        // Extract token from Cookie or Authorization header
        String token = getAuthToken(httpRequest);

        User authenticatedUser = null;
        if (token != null && authService.validateToken(token)) {
            String username = authService.extractUsername(token);
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isPresent()) {
                authenticatedUser = userOptional.get();
                httpRequest.setAttribute("authenticatedUser", authenticatedUser);
            }
        }

        // If it's a public path, proceed regardless of authentication
        if (isPublicPath) {
            chain.doFilter(request, response);
            return;
        }

        // If not public and no valid user, return 401
        if (authenticatedUser == null) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Invalid or missing token");
            return;
        }

        Role role = authenticatedUser.getRole();

        // Role-based access control
        if (requestURI.startsWith("/admin/") && role != Role.ADMIN) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: Admin access required");
            return;
        }

        // Shared endpoints: /api/auth/logout and /api/auth/me allow any authenticated role
        if (requestURI.equals("/api/auth/logout") || requestURI.equals("/api/auth/me")) {
            chain.doFilter(request, response);
            return;
        }

        // For customer-specific API paths (/api/cart, /api/orders, /api/payment)
        if (requestURI.startsWith("/api/") && role != Role.CUSTOMER && role != Role.ADMIN) {
            sendErrorResponse(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden: Customer access required");
            return;
        }

        chain.doFilter(request, response);
    }

    private void setCORSHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    private void sendErrorResponse(HttpServletResponse response, int statusCode, String message) throws IOException {
        setCORSHeaders(response);
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }

    private String getAuthToken(HttpServletRequest request) {
        // First check Cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
                    return cookie.getValue();
                }
            }
        }

        // Fallback to Authorization Header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
