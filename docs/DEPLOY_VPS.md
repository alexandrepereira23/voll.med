# Voll.med no VPS

Este pacote adiciona um Compose de produção com Caddy e um workflow de CI/CD.
O Compose de desenvolvimento (`docker-compose.yml`) continua separado.

## O que fica público

- Caddy nas portas TCP 80 e 443.
- Caddy encaminha `/api/*` para o backend e o restante para o frontend.
- MySQL, backend e frontend não publicam portas no host; conversam pela rede privada do Compose.
- Os volumes `mysql_data`, `caddy_data` e `caddy_config` persistem entre atualizações.

## Instalação no servidor

Copie `docker-compose.prod.yml`, a pasta `deploy/` e `.env.production.example` para a raiz do clone (`/opt/vollmed/app`). Crie o arquivo secreto sem adicioná-lo ao Git:

```bash
cd /opt/vollmed/app
cp .env.production.example .env
chmod 600 .env
openssl rand -hex 32
```

Gere valores independentes para `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` e `JWT_SECRET` e substitua os marcadores em `.env`. Defina também `ADMIN_PASSWORD` e confira `DOMAIN`. Não envie esses valores no chat nem os adicione ao GitHub.

Confira a configuração antes de iniciar:

```bash
docker compose --env-file .env -f docker-compose.prod.yml config --quiet
docker compose --env-file .env -f docker-compose.prod.yml up -d --build
docker compose --env-file .env -f docker-compose.prod.yml ps
docker compose --env-file .env -f docker-compose.prod.yml logs --tail=100 caddy backend
```

O endereço DNS precisa apontar para o IP da VPS e as portas 80 e 443 precisam estar liberadas no UFW e no firewall da Contabo. Caddy solicita e renova o certificado HTTPS automaticamente.

## GitHub Actions

Adicione estes Actions secrets ao repositório:

- `DEPLOY_HOST`: `13.140.161.188`
- `DEPLOY_USER`: `alexandre`
- `DEPLOY_SSH_KEY`: chave privada exclusiva para deploy; a chave pública correspondente deve estar em `~/.ssh/authorized_keys` no servidor.
- `DEPLOY_KNOWN_HOSTS`: linha de host obtida por `ssh-keyscan`, depois de comparar o fingerprint exibido por `ssh-keygen -lf` com o fingerprint confiável do servidor.

Depois de adicionar os arquivos ao repositório e fazer push para `main`, o workflow roda os testes e builds. Se todos passarem, conecta por SSH e atualiza a stack. O deploy assume que o clone do servidor está em `/opt/vollmed/app` e que `.env` já foi configurado lá.

## Primeiro deploy

Faça o primeiro deploy manual no servidor para validar `.env`, DNS, firewall e TLS. Configure as chaves de CI/CD e publique o workflow depois. O workflow pode ser executado manualmente na aba **Actions** ou em todo push futuro para `main`.

Não use `docker compose down -v`: isso apaga os volumes, inclusive os dados do MySQL.
