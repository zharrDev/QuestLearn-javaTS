package com.questlearn.security;

import com.questlearn.entity.User;
import com.questlearn.repository.UserRepository;
import io.quarkus.security.identity.IdentityProviderManager;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.runtime.QuarkusPrincipal;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.quarkus.vertx.http.runtime.security.ChallengeData;
import io.quarkus.vertx.http.runtime.security.HttpAuthenticationMechanism;
import io.quarkus.vertx.http.runtime.security.HttpCredentialTransport;
import io.smallrye.mutiny.Uni;
import io.vertx.ext.web.RoutingContext;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class JwtAuthMechanism implements HttpAuthenticationMechanism {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthMechanism.class);

    @Inject
    JwtTokenProvider tokenProvider;

    @Inject
    UserRepository userRepository;

    @Override
    public Uni<SecurityIdentity> authenticate(RoutingContext context, IdentityProviderManager identityProviderManager) {
        return Uni.createFrom().emitter(emitter -> {
            String authHeader = context.request().getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                emitter.complete(null);
                return;
            }
            String token = authHeader.substring(7);
            if (!tokenProvider.validateToken(token)) {
                emitter.complete(null);
                return;
            }
            try {
                String email = tokenProvider.getEmailFromToken(token);
                userRepository.findByEmail(email).ifPresentOrElse(
                        user -> emitter.complete(buildIdentity(user)),
                        () -> emitter.complete(null)
                );
            } catch (Exception e) {
                log.warn("JWT auth error: {}", e.getMessage());
                emitter.complete(null);
            }
        });
    }

    @Override
    public Uni<ChallengeData> getChallenge(RoutingContext context) {
        return Uni.createFrom().item(new ChallengeData(401, "WWW-Authenticate", "Bearer"));
    }

    @Override
    public HttpCredentialTransport getCredentialTransport() {
        return new HttpCredentialTransport(HttpCredentialTransport.Type.AUTHORIZATION, "Bearer");
    }

    private SecurityIdentity buildIdentity(User user) {
        return QuarkusSecurityIdentity.builder()
                .setPrincipal(new QuarkusPrincipal(user.getEmail()))
                .addAttribute("userId", user.getId())
                .addAttribute("userEmail", user.getEmail())
                .addAttribute("userRole", user.getRole().name())
                .addAttribute("userName", user.getNama())
                .addRole(user.getRole().name())
                .build();
    }
}
