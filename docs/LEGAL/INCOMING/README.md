# Paquetes legales recibidos

Esta carpeta conserva entregas originales para revisión. Su contenido no es normativo, no se publica en la aplicación y no autoriza producción.

## Teralya-Paquete-Legal-Claude-2026-07-14.pdf

- Origen: entrega manual de Claude al CTO.
- Fecha interna: 14/07/2026.
- SHA-256: `3604f8069033cb3052b6f9656d0f6e4a9724a6094dde77afa7ec07c192690c63`.
- Formato: PDF A4, 26 páginas, etiquetado, sin cifrado ni JavaScript.
- Revisión visual CTO: todas las páginas renderizan; no se observan cortes ni glifos rotos. El PDF conserva cabeceras, pies y rutas locales generadas por el navegador, por lo que no es una versión publicable.

## Bloqueos de reconciliación

1. El paquete usa `Decision Log 0023` y `0024` para decisiones legales. `0023` ya está asignada oficialmente a AWS/ADR-005; no se incorporan esos IDs.
2. Afirma que páginas legales y variables de backend/frontend ya fueron aplicadas, pero esos cambios no forman parte de la entrega recibida ni del estado verificado de `main`.
3. LEGAL-03 a LEGAL-09 contienen borradores que requieren extracción a archivos separados, contraste con CAP/INF y revisión de abogado, DPO y asesor fiscal antes de integrarse.
4. Las afirmaciones sobre IVA, impuestos especiales, desistimiento, cookies, RGPD y condición de intermediario no se consideran validadas por su presencia en este PDF.

La reconciliación deberá asignar nuevos IDs de decisión disponibles, separar cambios legales de cambios de producto y mantener `MINIMUM_PURCHASE_AGE` y `ALCOHOL_TERMS_VERSION` bloqueados para producción hasta validación profesional.
