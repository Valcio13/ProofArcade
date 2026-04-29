# ProofArcade Beta Deployment Plan

This document is the concrete deployment plan for the current ProofArcade beta.

It assumes the current product shape:
- the explorer frontend is the main product surface
- `Play`, `Playtest`, `Profile`, `Settings`, `Check-In`, and `Shop` live inside that frontend
- gameplay wallet actions still depend on admin RPC keystore routes

Because of that last point, this deployment plan is intentionally for a **beta launch**, not a final self-custodial launch.

## 1. Beta Topology

Recommended production host layout:

- public HTTPS entrypoint:
  - `443`
- optional HTTP redirect:
  - `80`
- internal node frontend:
  - `50001` explorer frontend
- internal public RPC:
  - `50002`
- internal admin RPC:
  - `50003`
- internal profiling:
  - `6060`

Recommended exposure model:

- public internet:
  - `443`
  - optionally proxied `POST/GET /rpc/*`
- **do not expose directly**:
  - `50001`
  - `50002`
  - `50003`
  - `6060`

Recommended routing:

- `/` -> `http://127.0.0.1:50001`
- `/rpc/` -> `http://127.0.0.1:50002/`
- `/admin/` -> `http://127.0.0.1:50003/`

Important:
- `/admin/` is required for the current beta wallet/game actions
- `/admin/` must be protected more tightly than `/rpc/`

## 2. Wallet Risk Posture

Current launch truth:

- wallet creation uses the node keystore
- wallet import/export uses encrypted keystore entries
- signing still depends on admin RPC access to node-managed keys

That means:

- the product is **not yet fully client-side self-custodial**
- the safest launch posture is:
  - `beta`
  - conservative reward/value exposure
  - explicit wallet warning in product copy

Recommended beta statement:

- "Wallet features are beta. Export your encrypted backup immediately and avoid storing meaningful value until the custody model is fully client-side."

## 3. Required Environment

For the explorer frontend, prefer same-origin proxy paths in production:

```env
VITE_NODE_ENV=production
VITE_CHAIN_ID=1
VITE_PUBLIC_RPC_URL=/rpc
VITE_PUBLIC_ADMIN_RPC_URL=/admin
```

Why:

- simpler browser networking
- avoids CORS complexity
- keeps the browser talking to one origin
- lets the reverse proxy control which backend routes are reachable

## 4. Node Config Recommendations

Before launch, explicitly review the active `config.json`.

Recommended launch-week values:

```json
{
  "headless": false,
  "autoUpdate": false,
  "pluginTimeoutMS": 1000,
  "faucetAddress": "",
  "rpcPort": "50002",
  "adminPort": "50003",
  "explorerPort": "50001",
  "walletPort": "50000"
}
```

And specifically verify:

- `adminRPCUrl` is local/internal only
- `rpcURL` is correct for the deployed node
- `faucetAddress` is empty unless you intentionally want beta faucet behavior
- profiling is not routed publicly

## 5. Reverse Proxy Rules

### Public surface

Allow:

- `GET /`
- static assets
- frontend routes
- `/rpc/*`

### Restricted beta wallet surface

Current beta needs:

- `/admin/v1/admin/keystore*`
- `/admin/v1/admin/tx-2048-*`
- `/admin/v1/admin/config`

Safer beta options:

1. protect all `/admin/*` behind an allowlist
2. protect `/admin/*` behind basic auth
3. expose `/admin/*` only through a private VPN / internal network

Best short-term beta choice:

- IP allowlist if the player group is small and controlled
- otherwise basic auth in front of `/admin/*`

## 6. Nginx Example

Use this as a starting point, not a final copy-paste without reviewing your domain and TLS setup.

```nginx
server {
    listen 80;
    server_name proofarcade.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name proofarcade.example.com;

    ssl_certificate     /etc/letsencrypt/live/proofarcade.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/proofarcade.example.com/privkey.pem;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:50001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /rpc/ {
        proxy_pass http://127.0.0.1:50002/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin/ {
        auth_basic "ProofArcade Beta Admin";
        auth_basic_user_file /etc/nginx/.htpasswd-proofarcade-admin;

        proxy_pass http://127.0.0.1:50003/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 7. Caddy Example

```caddy
proofarcade.example.com {
    encode gzip zstd

    handle /rpc/* {
        reverse_proxy 127.0.0.1:50002
    }

    handle /admin/* {
        basicauth {
            beta JDJhJDE0JHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4
        }
        reverse_proxy 127.0.0.1:50003
    }

    handle {
        reverse_proxy 127.0.0.1:50001
    }
}
```

## 8. Machine-Level Rules

Recommended host firewall posture:

- allow inbound:
  - `80`
  - `443`
- deny public inbound:
  - `50000`
  - `50001`
  - `50002`
  - `50003`
  - `6060`
  - `9001` unless intentionally peering publicly from the same host

If this node also serves P2P directly:

- review whether `9001` should be reachable from intended peers only

## 9. Build / Restart Workflow

Use this exact order:

```powershell
cd C:\path\to\canopy-main\cmd\rpc\web\explorer
npm run build

cd C:\path\to\canopy-main\plugin\typescript
npm test

cd C:\path\to\canopy-main
go build -buildvcs=false -a -o .\canopy.exe .\cmd\main

taskkill /IM canopy.exe /F
.\canopy.exe start
```

## 10. Launch-Day Minimum Checks

Before opening beta access:

1. open `/`
2. verify favicon, title, and ProofArcade branding
3. verify `/playtest`
4. verify `/auth`
5. create a wallet
6. export wallet backup
7. log out and log back in
8. start and submit a classic run
9. confirm points update
10. redeem in `/shop`
11. start and submit a daily run
12. confirm `/admin/*` is protected externally

## 11. Recommended Final Beta Decision

For the launch in a few days:

- launch as `ProofArcade Beta`
- protect `/admin/*`
- do not market the wallet as fully self-custodial
- keep faucet disabled
- keep auto-update disabled for launch week
- freeze major feature changes after deployment prep

