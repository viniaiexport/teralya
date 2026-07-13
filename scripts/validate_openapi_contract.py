#!/usr/bin/env python3
"""Validación normativa adicional del contrato OpenAPI de Teralya."""

from collections import Counter
from pathlib import Path
import re
import sys
import yaml


SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else "teralya-openapi-v1.0_EN_REVISION.yaml")
HTTP = {"get", "post", "put", "patch", "delete", "options", "head", "trace"}
PUBLIC = {1, 2, 3, 4, 5, 9, 10, 29, 30}
PAGED = {9, 19, 21, 27, 32, 35, 37, 40}
TAG_COUNTS = {
    "Autenticación": 4, "Bodegas": 4, "Vinos": 7, "Carrito": 5, "Checkout": 3,
    "Pedidos": 2, "SubPedidos": 3, "Administración": 13, "Sistema": 1,
    "Direcciones": 4, "Imágenes": 4,
}
MANIFEST = """
001 POST /auth/registro/comprador
002 POST /auth/login
003 POST /auth/recuperar-password
004 POST /auth/restablecer-password
005 POST /bodegas
006 PATCH /bodegas/yo/perfil
007 POST /bodegas/yo/vinos
008 PUT /bodegas/yo/vinos/{id}
009 GET /vinos
010 GET /vinos/{id}
011 POST /carrito/items
012 GET /carrito
013 PATCH /carrito/items/{id}
014 DELETE /carrito/items/{id}
015 DELETE /carrito
016 POST /checkout
017 POST /checkout/pago
018 GET /checkout/confirmacion/{pedido_id}
019 GET /pedidos
020 GET /pedidos/{id}
021 GET /bodegas/yo/subpedidos
022 GET /bodegas/yo/subpedidos/{id}
023 PATCH /bodegas/yo/subpedidos/{id}/estado
024 POST /admin/bodegas/{id}/validar
025 POST /admin/vinos/{id}/publicar
026 POST /admin/vinos/{id}/despublicar
027 GET /admin/pedidos
028 GET /admin/dashboard
029 POST /sistema/webhooks/stripe
030 GET /bodegas/{id}
031 GET /bodegas/yo/perfil
032 GET /bodegas/yo/vinos
033 GET /bodegas/yo/vinos/{id}
034 POST /bodegas/yo/vinos/{id}/solicitar-publicacion
035 GET /admin/bodegas
036 GET /admin/bodegas/{id}
037 GET /admin/vinos
038 GET /admin/vinos/{id}
039 GET /admin/pedidos/{id}
040 GET /admin/incidencias
041 GET /admin/incidencias/{id}
042 PATCH /admin/incidencias/{id}
043 POST /direcciones
044 GET /direcciones
045 PATCH /direcciones/{id}
046 DELETE /direcciones/{id}
047 POST /bodegas/yo/vinos/{id}/imagenes/upload-url
048 POST /bodegas/yo/vinos/{id}/imagenes
049 PATCH /bodegas/yo/vinos/{id}/imagenes/{imagen_id}
050 DELETE /bodegas/yo/vinos/{id}/imagenes/{imagen_id}
"""
EXPECTED = {int(c): (m.lower(), p) for c, m, p in (line.split() for line in MANIFEST.splitlines() if line)}
errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


def resolve_ref(doc, value):
    node = doc
    for token in value.removeprefix("#/").split("/"):
        node = node[token.replace("~1", "/").replace("~0", "~")]
    return node


doc = yaml.safe_load(SOURCE.read_text(encoding="utf-8"))
check(doc.get("openapi") == "3.1.0", "openapi debe ser 3.1.0")
check(doc.get("jsonSchemaDialect") == "https://json-schema.org/draft/2020-12/schema", "JSON Schema dialect incorrecto")

operations = {}
for path, item in doc.get("paths", {}).items():
    for method, operation in item.items():
        if method not in HTTP:
            continue
        match = re.fullmatch(r"API-(\d{3})", operation.get("x-teralya-api-code", ""))
        check(bool(match), f"{method.upper()} {path}: código API ausente o inválido")
        if not match:
            continue
        code = int(match.group(1))
        check(code not in operations, f"API-{code:03d} duplicada")
        operations[code] = (method, path, operation)

check(set(operations) == set(range(1, 51)), "deben existir exactamente API-001..API-050")
for code, expected in EXPECTED.items():
    if code not in operations:
        continue
    method, path, op = operations[code]
    check((method, path) == expected, f"API-{code:03d}: método/ruta alterados")
    check(op.get("operationId") == f"api{code:03d}", f"API-{code:03d}: operationId incorrecto")
    for field in ("summary", "description", "tags", "security", "responses", "x-teralya-cu", "x-teralya-pt"):
        check(field in op, f"API-{code:03d}: falta {field}")
    expected_security = [] if code in PUBLIC else [{"BearerOpaque": []}]
    check(op.get("security") == expected_security, f"API-{code:03d}: seguridad incorrecta")
    if code in PAGED:
        names = {p.get("name") for p in op.get("parameters", [])}
        check({"page", "page_size"} <= names, f"API-{code:03d}: paginación incompleta")
    for status, response in op.get("responses", {}).items():
        check("X-Request-Id" in response.get("headers", {}), f"API-{code:03d}/{status}: falta X-Request-Id")
        if status.startswith(("4", "5")):
            check("application/problem+json" in response.get("content", {}), f"API-{code:03d}/{status}: no usa Problem JSON")
        if status == "401":
            check("WWW-Authenticate" in response.get("headers", {}), f"API-{code:03d}/401: falta WWW-Authenticate")

check(Counter(op[2]["tags"][0] for op in operations.values()) == Counter(TAG_COUNTS), "distribución de tags incorrecta")
check(set(operations[17][2]["responses"]) == {"200", "400", "401", "404", "409", "502", "503"}, "API-017: respuestas incorrectas")
check("409" not in operations[18][2]["responses"], "API-018 no admite 409")
check({"201", "200"} <= set(operations[43][2]["responses"]), "API-043: faltan 201/200")
check({"201", "200"} <= set(operations[48][2]["responses"]), "API-048: faltan 201/200")
check(set(operations[46][2]["responses"]) & {"200", "201"} == set(), "API-046 debe responder 204")
check("204" in operations[46][2]["responses"] and "204" in operations[50][2]["responses"], "API-046/API-050: falta 204")
check(operations[29][2].get("x-raw-body-required") is True, "API-029: falta body crudo")
check(operations[29][2].get("security") == [], "API-029: debe usar Stripe-Signature obligatorio sin Bearer")

cart_merge = doc["components"]["schemas"]["CartMergeRequest"]["properties"]["items"]
check(cart_merge.get("minItems") == 1 and cart_merge.get("maxItems") == 100, "CartMergeRequest.items debe admitir 1..100")
check(cart_merge.get("x-unique-by") == "vino_id", "CartMergeRequest.items debe declarar vino_id único")
address = doc["components"]["schemas"]["AddressCreateRequest"]
check("nombre_destinatario" in address.get("properties", {}) and "nombre_destinatario" in address.get("required", []), "Address debe conservar nombre_destinatario de INF-10-A")

semantic_requirements = {
    16: ["únicamente las direcciones", "API-029"],
    23: ["pendiente→aceptado", "enviado→entregado", "terminales", "atómicos", "parcialmente_enviado"],
    25: ["pendiente_revision", "bodega está validada", "imagen confirmada y activa"],
    29: ["checkout.session.completed", "async_payment_succeeded", "async_payment_failed", "checkout.session.expired", "payment_status=paid", "300 segundos", "event.id"],
    34: ["estado inicial no publicado", "bodega validada", "imagen confirmada y activa"],
    47: ["10 minutos", "30 minutos"], 48: ["30 minutos", "HEAD", "URL CDN estable"],
}
for code, needles in semantic_requirements.items():
    description = operations[code][2].get("description", "")
    for needle in needles:
        check(needle in description, f"API-{code:03d}: falta semántica '{needle}'")

stripe_examples = operations[29][2]["requestBody"]["content"]["application/json"].get("examples", {})
expected_events = {"checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"}
check({e.get("value", {}).get("type") for e in stripe_examples.values()} == expected_events, "API-029: ejemplos no cubren allowlist")
confirmation = operations[18][2]["responses"]["200"]["content"]["application/json"]["examples"]["success"]["value"]
check(confirmation.get("pago_estado") == "pagado" and confirmation.get("pedido_estado") != "pendiente_pago", "API-018: ejemplo no confirmado")
for code, expected_state in ((25, "publicado"), (34, "pendiente_revision")):
    wine = operations[code][2]["responses"]["200"]["content"]["application/json"]["examples"]["success"]["value"]
    check(wine.get("estado") == expected_state and wine.get("stock_disponible", 0) > 0 and wine.get("disponible_venta") is True and len(wine.get("imagenes", [])) > 0, f"API-{code:03d}: ejemplo de vino incompatible con éxito")
upload = operations[47][2]["responses"]["200"]["content"]["application/json"]["examples"]["success"]["value"]
check(upload.get("upload_expires_at") == "2026-07-13T12:10:00Z" and upload.get("confirmation_expires_at") == "2026-07-13T12:30:00Z", "API-047: ejemplo TTL incoherente")

for path, expected_const in (("/admin/bodegas", "pendiente"), ("/admin/vinos", "pendiente_revision")):
    op = doc["paths"][path]["get"]
    estado = next((p for p in op.get("parameters", []) if p.get("name") == "estado"), {})
    check(estado.get("required") is True and estado.get("schema", {}).get("const") == expected_const, f"{path}: filtro estado incorrecto")


def walk(node, location="#"):
    if isinstance(node, dict):
        check("nullable" not in node, f"{location}: nullable no permitido")
        check("allOf" not in node, f"{location}: allOf no permitido")
        if "$ref" in node:
            try:
                resolve_ref(doc, node["$ref"])
            except (KeyError, TypeError):
                errors.append(f"{location}: $ref no resoluble {node['$ref']}")
        if node.get("type") == "object" and location.startswith("#/components/schemas") and not location.startswith("#/components/schemas/StripeEvent"):
            check(node.get("additionalProperties") is False, f"{location}: additionalProperties debe ser false")
        if {"subtotal", "gastos_envio", "impuestos", "total"} <= set(node) and all(isinstance(node[k], str) for k in ("subtotal", "gastos_envio", "impuestos", "total")):
            expected = float(node["subtotal"]) + float(node["gastos_envio"]) + float(node["impuestos"]) - float(node.get("descuentos", "0.00"))
            check(abs(expected - float(node["total"])) < 0.001, f"{location}: total monetario incoherente")
        for key, value in node.items():
            walk(value, f"{location}/{key}")
    elif isinstance(node, list):
        for index, value in enumerate(node):
            walk(value, f"{location}/{index}")


walk(doc)
if errors:
    print(f"FALLO: {len(errors)} incumplimientos")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)
print(f"OK: {SOURCE} — 50 operaciones, 41 rutas, 11 módulos y {len(doc['components']['schemas'])} schemas")
