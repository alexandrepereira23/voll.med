package med.voll.api.infra.aop;

import med.voll.api.domain.auditoria.AcaoAuditoria;
import med.voll.api.domain.prontuario.DadosDetalhamentoProntuario;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.service.AuditoriaProntuarioService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditoriaProntuarioAspect {

    private final AuditoriaProntuarioService auditoriaService;

    public AuditoriaProntuarioAspect(AuditoriaProntuarioService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @Around("execution(* med.voll.api.service.ProntuarioService.*(..))")
    public Object auditar(ProceedingJoinPoint jp) throws Throwable {
        String metodo = jp.getSignature().getName();
        Object[] args = jp.getArgs();
        Object resultado = null;

        try {
            resultado = jp.proceed();
            return resultado;
        } finally {
            try {
                Long prontuarioId = extrairProntuarioId(metodo, args, resultado);
                Long usuarioId = extrairUsuarioId();
                String ip = extrairIp();
                AcaoAuditoria acao = mapearAcao(metodo);

                auditoriaService.registrar(prontuarioId, usuarioId, acao, ip);
            } catch (Exception e) {
                // Auditoria nunca deve impedir o fluxo principal
            }
        }
    }

    private Long extrairProntuarioId(String metodo, Object[] args, Object resultado) {
        return switch (metodo) {
            // id vem do retorno após persistência
            case "criar", "atualizar" -> resultado instanceof DadosDetalhamentoProntuario d ? d.id() : null;
            // primeiro argumento é o prontuarioId
            case "detalhar", "inativar" -> args.length > 0 && args[0] instanceof Long id ? id : null;
            // listar / listarPorPaciente: sem prontuarioId específico
            default -> null;
        };
    }

    private Long extrairUsuarioId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario usuario) {
            return (long) usuario.getId();
        }
        return null;
    }

    private String extrairIp() {
        try {
            var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                return attrs.getRequest().getRemoteAddr();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private AcaoAuditoria mapearAcao(String metodo) {
        return switch (metodo) {
            case "criar" -> AcaoAuditoria.CRIOU;
            case "atualizar", "inativar" -> AcaoAuditoria.EDITOU;
            default -> AcaoAuditoria.VISUALIZOU;
        };
    }
}
