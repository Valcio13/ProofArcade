# ProofArcade Caddy Beta Setup

Use this for the current beta launch shape.

## What it does

- serves the main frontend from `127.0.0.1:50001`
- proxies public RPC requests from `/rpc/*` to `127.0.0.1:50002`
- proxies wallet/game admin actions from `/admin/*` to `127.0.0.1:50003`
- protects `/admin/*` with Caddy `basicauth`

## Before launch

1. Replace the domain in:
   - `deploy/caddy/ProofArcade.Caddyfile`
2. Generate a real admin password hash:

```powershell
caddy hash-password --plaintext "your-strong-password"
```

3. Replace this placeholder:

```text
$2a$14$replace_this_with_a_real_caddy_hash
```

4. Make sure the host firewall does **not** expose:
   - `50001`
   - `50002`
   - `50003`
   - `6060`

Only `80` and `443` should be public.

## Recommended frontend env

Use same-origin proxy paths:

```env
VITE_NODE_ENV=production
VITE_CHAIN_ID=1
VITE_PUBLIC_RPC_URL=/rpc
VITE_PUBLIC_ADMIN_RPC_URL=/admin
```

## Caution

This is still a beta hosted-wallet deployment:

- wallet creation uses the node keystore
- signing depends on admin RPC access
- do not present this as fully self-custodial yet

## Launch check

After deploy:

1. open `/`
2. open `/playtest`
3. register a wallet
4. log out and log back in
5. play classic and submit a score
6. redeem in `/shop`
7. verify `/admin/*` prompts for auth externally
