---
title: Inventory
---

Base URL: `/api/v1/inventory`

Notas:

- En la mayoría de recursos, los endpoints `GET /:id`, `PUT /:id`, `DELETE /:id` validan que el ID exista mediante `express-validator`. Si el ID no existe, la API responde **400** con el formato de error de validación (ver [docs/api/README.md](../)).

## Recursos

- [Categorías](category/)
- [Unidades de medida](measurement-unit/)
- [Insumos](supply/)
- [Lotes de stock](stock-lot/)
- [Movimientos de stock](stock-movement/)
- [Insumos por consulta](supply-consultation/)
- [Presentaciones de insumos](supply-presentation/)
