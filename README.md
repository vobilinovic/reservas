# DAP Manager — Sistema de Reservas Charter

Sistema de gestión de vuelos charter para Aerovías DAP.

## Estructura del proyecto

```
reservas/
├── back/    # FastAPI + Python + SQL Server
└── front/   # React + Vite + TypeScript
```

## Paso 1 completado: Auth + Roles
- [x] Tablas SQL: empresas, roles, usuarios
- [x] JWT con RUT como identificador
- [x] Sistema de niveles de rol (1-4)
- [x] Endpoints: POST /login, GET /me, POST /usuarios
- [x] Adaptador KIU desacoplado (mock listo, real pendiente)

## Siguiente: Paso 2 — Módulo de vuelos
- [ ] Tabla vuelos en SQL Server
- [ ] Endpoint GET /vuelos con filtros
- [ ] Integración con KIU mock adapter
