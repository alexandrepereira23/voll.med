package med.voll.api.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LIMITE_TENTATIVAS = 10;
    private static final long JANELA_SEGUNDOS = 15 * 60L; // 15 minutos

    private final Map<String, LinkedList<Instant>> registros = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        var ip = request.getRemoteAddr();
        var agora = Instant.now();
        var limite = agora.minusSeconds(JANELA_SEGUNDOS);

        var tentativas = registros.computeIfAbsent(ip, k -> new LinkedList<>());

        synchronized (tentativas) {
            tentativas.removeIf(t -> t.isBefore(limite));

            if (tentativas.size() >= LIMITE_TENTATIVAS) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(
                        "{\"erro\":\"Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.\"}");
                return;
            }

            tentativas.add(agora);
        }

        chain.doFilter(request, response);
    }
}
