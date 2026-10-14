# Deploy das APIs na VPS

Os dois frontends continuam na Vercel. A VPS executa as APIs, o MySQL do Voll.med e o Caddy, que termina o HTTPS para as duas APIs.

| Host | Destino |
|---|---|
| `vollmed.usenexora.online` | Frontend Voll.med na Vercel |
| `consulta-cep.usenexora.online` | Frontend Consultar-Cep na Vercel |
| `api-vollmed.usenexora.online` | Serviço `backend` no Compose |
| `api-cep.usenexora.online` | Serviço `consultacep` no Compose |

Crie registros A para os dois hosts `api-*`, apontando para o IP público da VPS. Configure os dois domínios dos painéis na Vercel e use os destinos CNAME/records mostrados em cada projeto. Libere as portas TCP 80 e 443 na VPS e no firewall do provedor.

## Preparar a VPS

Instale Docker Engine com o plugin Docker Compose para a distribuição Linux da VPS. Crie um usuário de deploy com acesso ao Docker e autenticação SSH por chave. Os comandos abaixo presumem que ambos os repositórios públicos serão clonados em `/opt/vollmed/app` e `/opt/vollmed/cep`:

```bash
sudo mkdir -p /opt/vollmed
sudo chown "$USER":"$USER" /opt/vollmed
git clone https://github.com/alexandrepereira23/voll.med.git /opt/vollmed/app
git clone https://github.com/alexandrepereira23/Consultar-Cep.git /opt/vollmed/cep
cp /opt/vollmed/app/.env.production.example /opt/vollmed/app/.env
chmod 600 /opt/vollmed/app/.env
```

Edite `/opt/vollmed/app/.env`, substitua os marcadores por valores fortes e configure:

- Gere valores independentes para `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` e `JWT_SECRET` (por exemplo, com `openssl rand -hex 32`). Defina também `ADMIN_PASSWORD`.

- `VOLL_MED_API_DOMAIN=api-vollmed.usenexora.online`
- `CEP_API_DOMAIN=api-cep.usenexora.online`
- `CEP_API_KEY`: uma chave forte compartilhada somente entre as duas APIs
- `CEP_CORS_ORIGENS_PERMITIDAS`: domínio público do painel CEP e seu domínio Vercel estável, separados por vírgula
- `CEP_BACKEND_CONTEXT=../cep/backend`

Use a mesma chave em `CEP_API_KEY` e na variável `API_KEY_VALOR` do serviço Consultar-Cep. O backend Voll.med chama o CEP internamente por `http://consultacep:8080`, dentro da rede Docker. Não publique a porta do MySQL nem das APIs diretamente no host.

Faça o primeiro deploy manual depois de configurar o DNS e o arquivo `.env`:

```bash
cd /opt/vollmed/app
docker compose --env-file .env -f docker-compose.prod.yml config --quiet
docker compose --env-file .env -f docker-compose.prod.yml up -d --build --remove-orphans
docker compose --env-file .env -f docker-compose.prod.yml ps
```

O Caddy solicita os certificados HTTPS automaticamente quando os dois registros DNS já apontam para a VPS e as portas 80/443 estão acessíveis.

## Deploy automático pelo GitHub Actions

Configure estes segredos no ambiente GitHub `production` de **cada repositório**:

- `DEPLOY_HOST`: IP ou hostname SSH da VPS
- `DEPLOY_USER`: usuário de deploy
- `DEPLOY_SSH_KEY`: chave privada SSH autorizada para esse usuário
- `DEPLOY_KNOWN_HOSTS`: chave de host SSH da VPS verificada por um canal confiável

No projeto Voll.med da Vercel, defina `VITE_API_BASE_URL=https://api-vollmed.usenexora.online/api` no ambiente Production. O painel Consultar-Cep usa `https://api-cep.usenexora.online/api/v1` no build de produção.

Push na branch `main` do Consultar-Cep atualiza `/opt/vollmed/cep` e reconstrói somente `consultacep`. Push na branch `main` do Voll.med atualiza `/opt/vollmed/app` e reconcilia toda a stack. Nenhum segredo deve ser colocado no código ou enviado pelo chat.

## Dados do Railway

O Compose cria um volume MySQL novo. Antes de apontar o tráfego de produção para a VPS, exporte o banco atual do Railway e restaure-o no MySQL da VPS. As migrations Flyway atualizam o schema, mas não transferem os dados existentes.

Não use `docker compose down -v`: isso apaga os volumes persistentes, inclusive os dados do MySQL e os certificados do Caddy.
