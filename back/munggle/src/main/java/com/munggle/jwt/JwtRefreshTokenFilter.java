package com.munggle.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtRefreshTokenFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String refreshToken = jwtProvider.resolveRefreshToken(request);

        if (jwtProvider.validateToken(refreshToken)) {
            Authentication authentication = jwtProvider.getAuthentication(refreshToken);
            String newAccessToken = jwtProvider.createAccessToken(authentication);
            response.setHeader("Authorization", "Bearer " + newAccessToken);
        }
    }
}