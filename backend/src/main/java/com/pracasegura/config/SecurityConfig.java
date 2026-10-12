package com.pracasegura.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import com.pracasegura.repository.AppUserRepository;

@Configuration
public class SecurityConfig {

@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public UserDetailsService userDetailsService(
        AppUserRepository userRepository) {

    return email -> userRepository.findByEmail(
            email.trim().toLowerCase()
    ).map(user -> User.withUsername(user.getEmail())
            .password(user.getPassword())
            .roles(user.getRole())
            .build()
    ).orElseThrow(() ->
            new UsernameNotFoundException("Usuário não encontrado.")
    );
}

@Bean
public AuthenticationManager authenticationManager(
        AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
}

@Bean
public SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
}

@Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        SecurityContextRepository securityContextRepository)
        throws Exception {

    http
        // Configuração temporária para o MVP local.
        // Antes de publicar, será necessário configurar CSRF.
        .csrf(csrf -> csrf.disable())

        .securityContext(context -> context
            .securityContextRepository(securityContextRepository)
        )

        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
        )

        .formLogin(form -> form.disable())
        .httpBasic(basic -> basic.disable())

        .authorizeHttpRequests(auth -> auth

            .requestMatchers("/api/auth/**", "/api/health")
                .permitAll()

            .requestMatchers(HttpMethod.GET,
                "/api/squares", "/api/squares/**")
                .permitAll()

            .requestMatchers(HttpMethod.GET,
                "/api/occurrences", "/api/occurrences/**")
                .authenticated()

            .requestMatchers(HttpMethod.POST, "/api/occurrences")
                .hasRole("CIDADAO")

            .requestMatchers(HttpMethod.PATCH,
                "/api/occurrences/*/status")
                .hasRole("GESTOR")

            .requestMatchers(HttpMethod.POST,
                "/api/squares", "/api/squares/**")
                .hasRole("GESTOR")

            .requestMatchers(HttpMethod.PUT,
                "/api/squares/**")
                .hasRole("GESTOR")

            .requestMatchers(HttpMethod.DELETE,
                "/api/squares/**")
                .hasRole("GESTOR")

            .anyRequest().authenticated()
        );

    return http.build();
}
}
