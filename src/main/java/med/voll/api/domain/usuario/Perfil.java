package med.voll.api.domain.usuario;

import org.springframework.security.core.GrantedAuthority;

public enum Perfil implements GrantedAuthority {

    ROLE_ADMIN,
    ROLE_FUNCIONARIO,
    ROLE_MEDICO;

    @Override
    public String getAuthority() {
        return name();
    }
}