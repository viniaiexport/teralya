from copy import deepcopy
from pathlib import Path
import re
import yaml

OUT = Path("docs/INF/openapi/teralya-openapi-v1.1.yaml")


def ref(name):
    return {"$ref": f"#/components/schemas/{name}"}


def string(**kw):
    return {"type": "string", **kw}


def integer(**kw):
    return {"type": "integer", **kw}


def boolean(**kw):
    return {"type": "boolean", **kw}


def array(items, max_items=None, min_items=None):
    out = {"type": "array", "items": items}
    if max_items is not None:
        out["maxItems"] = max_items
    if min_items is not None:
        out["minItems"] = min_items
    return out


def obj(properties, required=(), **kw):
    out = {"type": "object", "additionalProperties": False, "properties": properties}
    if required:
        out["required"] = list(required)
    out.update(kw)
    return out


def merge(*schemas, exclude=()):
    props, required = {}, []
    for schema in schemas:
        for key, value in schema.get("properties", {}).items():
            if key in exclude:
                continue
            if key in props and props[key] != value:
                raise ValueError(f"schema collision: {key}")
            props[key] = deepcopy(value)
        for key in schema.get("required", []):
            if key not in exclude and key not in required:
                required.append(key)
    return obj(props, required)


UUID = string(format="uuid")
DATE = string(format="date")
DATETIME = string(format="date-time")
EMAIL = string(format="email", minLength=3, maxLength=254)
PASSWORD = string(minLength=12, maxLength=128, writeOnly=True)
RECOVERY_TOKEN = string(minLength=32, maxLength=512, writeOnly=True)
CONFIRMATION_TOKEN_OUT = string(minLength=32, maxLength=4096, readOnly=True)
CONFIRMATION_TOKEN_IN = string(minLength=32, maxLength=4096, writeOnly=True)
URI = string(format="uri", minLength=1, maxLength=2048)
T32 = string(minLength=1, maxLength=32)
T80 = string(minLength=1, maxLength=80)
T100 = string(minLength=1, maxLength=100)
T160 = string(minLength=1, maxLength=160)
T200 = string(minLength=1, maxLength=200)
T500 = string(minLength=1, maxLength=500)
T5000 = string(minLength=1, maxLength=5000)
MONEY = string(pattern=r"^(0|[1-9][0-9]{0,7})\.[0-9]{2}$")
POSITIVE_MONEY = string(pattern=r"^(?!0\.00$)(0|[1-9][0-9]{0,7})\.[0-9]{2}$")
PERCENT = string(pattern=r"^(100\.00|([0-9]|[1-9][0-9])\.[0-9]{2})$")
CURRENCY = string(enum=["EUR"])
LANG = string(enum=["es", "en", "fr", "de", "it"])
ROLE = string(enum=["comprador", "bodega", "administrador"])
USER_STATE = string(enum=["pendiente_verificacion", "activo", "suspendido", "bloqueado", "eliminado"])
WINERY_STATE = string(enum=["borrador", "pendiente_revision", "aprobada", "activa", "suspendida", "archivada"])
WINE_STATE = string(enum=["borrador", "pendiente_revision", "publicado", "oculto", "archivado"])
CART_STATE = string(enum=["activo", "convertido", "abandonado", "cancelado"])
CART_ITEM_STATE = string(enum=["disponible", "sin_stock", "descatalogado", "precio_modificado"])
ORDER_STATE = string(enum=["pendiente_pago", "pagado", "en_preparacion", "parcialmente_enviado", "enviado", "entregado", "cancelado", "devuelto"])
ORDER_ITEM_STATE = string(enum=["normal", "cancelado", "devuelto"])
PAYMENT_STATE = string(enum=["pendiente", "autorizado", "pagado", "parcialmente_reembolsado", "reembolsado", "fallido", "cancelado"])
SUBORDER_STATE = string(enum=["pendiente", "aceptado", "en_preparacion", "enviado", "entregado", "cancelado", "incidencia"])
INCIDENT_STATE = string(enum=["abierta", "en_revision", "resuelta", "cerrada"])
CANCELLATION_STATE = string(enum=["procesando", "completada", "fallida"])
REFUND_STATE = string(enum=["pending", "requires_action", "succeeded", "failed", "canceled"])
QUANTITY = integer(minimum=1, maximum=999)
STOCK = integer(minimum=0, maximum=999999)
YEAR = integer(minimum=1800, maximum=2100)

schemas = {}


def add(name, schema):
    schemas[name] = schema
    return schema


add("FieldError", obj({"field": T200, "code": T80, "message": T500}, ["field", "code", "message"]))
add("Problem", obj({
    "type": URI, "title": T160, "status": integer(minimum=400, maximum=599), "detail": T500,
    "instance": string(minLength=1, maxLength=2048), "code": T80, "request_id": UUID,
    "field_errors": array(ref("FieldError"), max_items=50), "retryable": boolean(),
}, ["type", "title", "status", "detail", "code", "request_id", "retryable"]))
add("GenericAck", obj({"message": T500, "request_id": UUID}, ["message", "request_id"]))
add("MoneyBreakdown", obj({
    "subtotal": MONEY, "gastos_envio": MONEY, "impuestos": MONEY, "descuentos": MONEY,
    "total": MONEY, "moneda": CURRENCY,
}, ["subtotal", "gastos_envio", "impuestos", "descuentos", "total", "moneda"]))
add("SubOrderMoneyBreakdown", obj({
    "subtotal": MONEY, "gastos_envio": MONEY, "impuestos": MONEY, "total": MONEY, "moneda": CURRENCY,
}, ["subtotal", "gastos_envio", "impuestos", "total", "moneda"]))

add("RegisterBuyerRequest", obj({
    "email": EMAIL, "password": PASSWORD, "nombre": T100, "apellidos": T100,
    "fecha_nacimiento": DATE, "declaracion_mayoria_edad": {"type": "boolean", "const": True},
    "aceptacion_condiciones_alcohol": {"type": "boolean", "const": True}, "idioma": LANG,
}, ["email", "password", "nombre", "apellidos", "fecha_nacimiento", "declaracion_mayoria_edad", "aceptacion_condiciones_alcohol"]))
add("LoginRequest", obj({"email": EMAIL, "password": PASSWORD}, ["email", "password"]))
add("PasswordRecoveryRequest", obj({"email": EMAIL}, ["email"]))
add("PasswordResetRequest", obj({
    "token": RECOVERY_TOKEN, "password_nueva": PASSWORD, "confirmacion_password": PASSWORD,
}, ["token", "password_nueva", "confirmacion_password"]))
add("UsuarioSesion", obj({
    "id": UUID, "email": EMAIL, "rol": ROLE, "idioma": LANG, "estado": USER_STATE,
    "nombre": T100, "apellidos": T100, "bodega_id": UUID,
}, ["id", "email", "rol", "idioma", "estado"]))
add("AuthSession", obj({
    "access_token": string(pattern=r"^[A-Za-z0-9_-]{43}$", readOnly=True),
    "token_type": {"type": "string", "const": "Bearer"}, "expires_in": {"type": "integer", "const": 28800},
    "expires_at": DATETIME, "usuario": ref("UsuarioSesion"),
}, ["access_token", "token_type", "expires_in", "expires_at", "usuario"]))

add("BodegaRegistrationRequest", obj({
    "nombre_comercial": T160, "razon_social": T200, "cif_vat": T32, "email": EMAIL,
    "password": PASSWORD, "persona_contacto": T100, "telefono": T32,
    "aceptacion_condiciones": {"type": "boolean", "const": True}, "pais_contacto": T100,
    "ciudad": T100, "codigo_postal": string(minLength=1, maxLength=20),
}, ["nombre_comercial", "razon_social", "cif_vat", "email", "password", "persona_contacto", "telefono", "aceptacion_condiciones"]))
winery_patch_props = {
    "nombre_comercial": T160, "historia": T5000, "filosofia": T5000, "region": T160,
    "pais": T100, "denominacion_origen": T160, "anio_fundacion": YEAR, "web": URI,
    "video_url": URI, "email_principal": EMAIL, "telefono": T32, "persona_contacto": T100,
    "logo_url": URI, "imagen_principal_url": URI,
    "paises_envio": array(string(pattern=r"^[A-Z]{2}$"), max_items=27),
    "plazo_preparacion_dias": integer(minimum=0, maximum=365),
    "plazo_entrega_estimado": string(minLength=1, maxLength=1000),
    "coste_envio_descripcion": string(minLength=1, maxLength=2000),
    "transportista_habitual": T160,
    "restricciones_entrega": string(minLength=1, maxLength=2000),
    "condiciones_empaquetado": string(minLength=1, maxLength=2000),
    "capacidad_internacional": boolean(),
}
add("BodegaProfilePatch", obj(winery_patch_props, minProperties=1))
add("BodegaSummary", obj({
    "id": UUID, "nombre_comercial": T160, "slug": T160, "logo_url": URI,
    "region": T160, "pais": T100, "denominacion_origen": T160,
}, ["id", "nombre_comercial"]))
public_winery_props = {
    "id": UUID, "nombre_comercial": T160, "vinos": array(ref("WineSummary")), "slug": T160,
    "logo_url": URI, "imagen_principal_url": URI, "historia": T5000, "filosofia": T5000,
    "region": T160, "pais": T100, "denominacion_origen": T160, "anio_fundacion": YEAR,
    "web": URI, "video_url": URI,
    "paises_envio": array(string(pattern=r"^[A-Z]{2}$"), max_items=27),
    "plazo_preparacion_dias": integer(minimum=0, maximum=365),
    "plazo_entrega_estimado": string(minLength=1, maxLength=1000),
    "coste_envio_descripcion": string(minLength=1, maxLength=2000),
    "transportista_habitual": T160,
    "restricciones_entrega": string(minLength=1, maxLength=2000),
    "condiciones_empaquetado": string(minLength=1, maxLength=2000),
    "capacidad_internacional": boolean(),
}
add("BodegaPublic", obj(public_winery_props, ["id", "nombre_comercial", "vinos"]))
self_winery_props = {k: v for k, v in public_winery_props.items() if k != "vinos"}
self_winery_props.update({
    "estado": WINERY_STATE, "created_at": DATETIME, "updated_at": DATETIME, "razon_social": T200,
    "cif_vat": T32, "email_principal": EMAIL, "telefono": T32, "persona_contacto": T100,
    "direccion_fisica": T200, "codigo_postal": string(minLength=1, maxLength=20), "ciudad": T100,
    "provincia": T100, "pais_contacto": T100,
})
add("BodegaSelf", obj(self_winery_props, ["id", "nombre_comercial", "estado", "created_at", "updated_at"]))
add("BodegaAdminSummary", obj({
    "id": UUID, "nombre_comercial": T160, "estado": WINERY_STATE, "created_at": DATETIME,
    "razon_social": T200, "cif_vat": T32, "pais_contacto": T100,
}, ["id", "nombre_comercial", "estado", "created_at"]))
admin_winery = merge(schemas["BodegaSelf"])
admin_winery["properties"].update({"fecha_alta": DATETIME, "fecha_aprobacion": DATETIME})
add("BodegaAdmin", admin_winery)

wine_optional = {
    "sku": T100, "tipo_vino": T80, "anada": YEAR, "pais": T100, "region": T160,
    "denominacion_origen": T160, "variedades_uva": array(T100, max_items=20), "crianza": T100,
    "meses_crianza": integer(minimum=0, maximum=120), "graduacion_alcoholica": PERCENT,
    "volumen_ml": integer(minimum=1, maximum=10000), "descripcion_corta": T500,
    "descripcion_completa": T5000, "nota_cata": T5000, "maridaje": T5000,
    "temperatura_servicio": T100, "certificaciones": array(T100, max_items=20),
    "premios": array(T100, max_items=20), "produccion_limitada": boolean(),
    "peso_gramos": integer(minimum=1, maximum=100000), "plazo_preparacion_dias": integer(minimum=0, maximum=365),
    "botellas_por_caja": integer(minimum=1, maximum=100),
}
wine_write_props = {"nombre_comercial": T160, "precio": POSITIVE_MONEY, "moneda": CURRENCY, "stock_disponible": STOCK, "disponible_venta": boolean(), **wine_optional}
wine_write_required = ["nombre_comercial", "precio", "moneda", "stock_disponible", "disponible_venta"]
add("WineCreateRequest", obj(wine_write_props, wine_write_required))
add("WineUpdateRequest", obj(wine_write_props, wine_write_required, description="PUT completo: cada opcional omitido vuelve a NULL/default; no conserva el valor previo."))
add("ImageSummary", obj({
    "id": UUID, "url": URI, "es_principal": boolean(), "orden": integer(minimum=0, maximum=999),
    "alt_text": T500, "resolucion": T32,
}, ["id", "url", "es_principal", "orden", "alt_text"]))
add("WineSummary", obj({
    "id": UUID, "nombre_comercial": T160, "precio": MONEY, "moneda": CURRENCY,
    "disponible_venta": boolean(), "bodega": ref("BodegaSummary"), "slug": T160,
    "tipo_vino": T80, "anada": YEAR, "region": T160, "denominacion_origen": T160,
    "imagen_principal": ref("ImageSummary"),
}, ["id", "nombre_comercial", "precio", "moneda", "disponible_venta", "bodega"]))
wine_public = merge(schemas["WineSummary"])
wine_public["properties"].update({
    "imagenes": array(ref("ImageSummary")), "pais": T100, "variedades_uva": array(T100, max_items=20),
    "crianza": T100, "meses_crianza": integer(minimum=0, maximum=120), "graduacion_alcoholica": PERCENT,
    "volumen_ml": integer(minimum=1, maximum=10000), "descripcion_corta": T500,
    "descripcion_completa": T5000, "nota_cata": T5000, "maridaje": T5000,
    "temperatura_servicio": T100, "certificaciones": array(T100, max_items=20),
    "premios": array(T100, max_items=20), "produccion_limitada": boolean(),
})
wine_public["required"].append("imagenes")
add("WinePublicDetail", wine_public)
add("WineOwnSummary", obj({
    "id": UUID, "nombre_comercial": T160, "estado": WINE_STATE, "stock_disponible": STOCK,
    "disponible_venta": boolean(), "updated_at": DATETIME, "sku": T100, "precio": MONEY,
    "moneda": CURRENCY, "imagen_principal": ref("ImageSummary"),
}, ["id", "nombre_comercial", "estado", "stock_disponible", "disponible_venta", "updated_at"]))
wine_own = merge(schemas["WinePublicDetail"])
wine_own["properties"].update({
    "estado": WINE_STATE, "stock_disponible": STOCK, "stock_reservado": STOCK, "stock_minimo": STOCK,
    "created_at": DATETIME, "updated_at": DATETIME, "sku": T100, "peso_gramos": integer(minimum=1, maximum=100000),
    "plazo_preparacion_dias": integer(minimum=0, maximum=365), "botellas_por_caja": integer(minimum=1, maximum=100),
})
wine_own["required"] += ["estado", "stock_disponible", "stock_reservado", "stock_minimo", "created_at", "updated_at"]
add("WineOwnDetail", wine_own)
add("WineAdminSummary", obj({
    "id": UUID, "nombre_comercial": T160, "estado": WINE_STATE, "bodega": ref("BodegaAdminSummary"),
    "updated_at": DATETIME, "precio": MONEY, "moneda": CURRENCY, "imagen_principal": ref("ImageSummary"),
}, ["id", "nombre_comercial", "estado", "bodega", "updated_at"]))
wine_admin = merge(schemas["WineOwnDetail"], exclude=("bodega",))
wine_admin["properties"]["bodega"] = ref("BodegaAdminSummary")
wine_admin["required"].append("bodega")
add("WineAdminDetail", wine_admin)
add("Image", obj({
    "id": UUID, "url": URI, "es_principal": boolean(), "orden": integer(minimum=0, maximum=999),
    "alt_text": T500, "formato": string(enum=["jpeg", "png", "webp"]), "activa": boolean(),
    "fecha_subida": DATETIME, "updated_at": DATETIME, "nombre_archivo": T200,
    "tamanio_bytes": integer(minimum=1, maximum=10485760), "resolucion": T32,
}, ["id", "url", "es_principal", "orden", "alt_text", "formato", "activa", "fecha_subida", "updated_at"]))
add("UploadRequest", obj({
    "upload_id": UUID, "nombre_archivo": T200,
    "content_type": string(enum=["image/jpeg", "image/png", "image/webp"]),
    "tamanio_bytes": integer(minimum=1, maximum=10485760),
    "checksum_sha256": string(pattern=r"^[A-Za-z0-9+/]{43}=$"),
}, ["upload_id", "nombre_archivo", "content_type", "tamanio_bytes", "checksum_sha256"]))
add("RequiredUploadHeaders", obj({
    "Content-Type": string(enum=["image/jpeg", "image/png", "image/webp"]),
    "x-amz-checksum-sha256": string(pattern=r"^[A-Za-z0-9+/]{43}=$"),
    "If-None-Match": {"type": "string", "const": "*"},
}, ["Content-Type", "x-amz-checksum-sha256", "If-None-Match"]))
add("UploadAuthorization", obj({
    "upload_id": UUID, "upload_url": URI, "method": {"type": "string", "const": "PUT"},
    "required_headers": ref("RequiredUploadHeaders"), "confirmation_token": CONFIRMATION_TOKEN_OUT,
    "upload_expires_at": DATETIME, "confirmation_expires_at": DATETIME,
}, ["upload_id", "upload_url", "method", "required_headers", "confirmation_token", "upload_expires_at", "confirmation_expires_at"]))
add("ImageConfirmRequest", obj({
    "upload_id": UUID, "confirmation_token": CONFIRMATION_TOKEN_IN, "alt_text": T500,
    "orden": integer(minimum=0, maximum=999), "es_principal": boolean(),
}, ["upload_id", "confirmation_token", "alt_text"]))
add("ImagePatchRequest", obj({"alt_text": T500, "orden": integer(minimum=0, maximum=999), "es_principal": boolean()}, minProperties=1))

add("CartAddRequest", obj({"vino_id": UUID, "cantidad": QUANTITY}, ["vino_id", "cantidad"]))
add("LocalCartItem", obj({"vino_id": UUID, "cantidad_local": QUANTITY}, ["vino_id", "cantidad_local"]))
merge_items = array(ref("LocalCartItem"), min_items=1, max_items=100)
merge_items.update({"description": "Entre 1 y 100 líneas; vino_id debe ser único dentro del array.", "x-unique-by": "vino_id"})
add("CartMergeRequest", obj({"fusion_id": UUID, "items": merge_items}, ["fusion_id", "items"]))
add("CartRequest", {"oneOf": [ref("CartAddRequest"), ref("CartMergeRequest")]})
add("QuantityPatchRequest", obj({"cantidad": QUANTITY}, ["cantidad"]))
add("CartItem", obj({
    "id": UUID, "vino": ref("WineSummary"), "cantidad": QUANTITY, "precio_unitario": MONEY,
    "importe_total": MONEY, "estado": CART_ITEM_STATE,
}, ["id", "vino", "cantidad", "precio_unitario", "importe_total", "estado"]))
add("Cart", obj({
    "id": UUID, "estado": CART_STATE, "items": array(ref("CartItem")), "num_productos": integer(minimum=0),
    "num_botellas": integer(minimum=0), "subtotal": MONEY, "gastos_envio": MONEY, "descuentos": MONEY,
    "total": MONEY, "moneda": CURRENCY, "updated_at": DATETIME,
}, ["id", "estado", "items", "num_productos", "num_botellas", "subtotal", "gastos_envio", "descuentos", "total", "moneda", "updated_at"]))
add("FusionLine", obj({
    "vino_id": UUID, "estado": string(enum=["fusionada", "limitada", "descartada"]),
    "cantidad_resultante": STOCK, "motivo": T160,
}, ["vino_id", "estado"]))
add("CartMutationResponse", obj({"carrito": ref("Cart"), "fusion": array(ref("FusionLine"))}, ["carrito"]))

address_props = {
    "uso": string(enum=["envio", "facturacion", "ambos"]), "nombre_destinatario": T160,
    "direccion": T200, "codigo_postal": string(minLength=1, maxLength=20), "ciudad": T100,
    "pais": T100, "nombre_identificativo": T100, "empresa": T160, "direccion_adicional": T200,
    "provincia": T100, "persona_contacto": T100, "telefono": T32, "email": EMAIL, "es_principal": boolean(),
}
address_required = ["uso", "nombre_destinatario", "direccion", "codigo_postal", "ciudad", "pais"]
add("AddressCreateRequest", obj(address_props, address_required))
add("AddressPatchRequest", obj(address_props, minProperties=1))
address_response_props = {"id": UUID, **address_props, "activa": boolean(), "created_at": DATETIME, "updated_at": DATETIME}
add("Address", obj(address_response_props, ["id", *address_required, "es_principal", "activa", "created_at", "updated_at"]))
snapshot_props = {k: v for k, v in address_props.items() if k not in ("uso", "es_principal", "nombre_identificativo")}
add("AddressSnapshot", obj(snapshot_props, ["nombre_destinatario", "direccion", "codigo_postal", "ciudad", "pais"]))

add("CheckoutRequest", obj({"direccion_envio_id": UUID, "direccion_facturacion_id": UUID}, ["direccion_envio_id", "direccion_facturacion_id"]))
add("CheckoutSessionRequest", obj({"pedido_id": UUID}, ["pedido_id"]))
add("OrderLine", obj({
    "id": UUID, "vino_id": UUID, "nombre_vino": T160, "bodega": T160, "precio_unitario": MONEY,
    "cantidad": QUANTITY, "importe_total": MONEY, "anada": YEAR,
}, ["id", "vino_id", "nombre_vino", "bodega", "precio_unitario", "cantidad", "importe_total"]))
add("OrderPrepared", obj({
    "id": UUID, "numero_pedido": T100, "estado": {"type": "string", "const": "pendiente_pago"},
    "totales": ref("MoneyBreakdown"), "direccion_envio_snapshot": ref("AddressSnapshot"),
    "direccion_facturacion_snapshot": ref("AddressSnapshot"),
}, ["id", "numero_pedido", "estado", "totales", "direccion_envio_snapshot", "direccion_facturacion_snapshot"]))
add("CheckoutSession", obj({
    "pedido_id": UUID, "checkout_url": URI, "session_expires_at": DATETIME, "reused": boolean(),
}, ["pedido_id", "checkout_url", "session_expires_at", "reused"]))
add("OrderConfirmation", obj({
    "pedido_id": UUID, "numero_pedido": T100, "pago_estado": PAYMENT_STATE, "pedido_estado": ORDER_STATE,
    "confirmado_at": DATETIME,
}, ["pedido_id", "numero_pedido", "pago_estado", "pedido_estado"]))
add("OrderSummary", obj({
    "id": UUID, "numero_pedido": T100, "estado": ORDER_STATE, "total": MONEY, "moneda": CURRENCY,
    "created_at": DATETIME,
}, ["id", "numero_pedido", "estado", "total", "moneda", "created_at"]))
buyer_order = merge(schemas["OrderSummary"])
add("OrderCancellationSummary", obj({
    "estado": CANCELLATION_STATE, "reembolso_estado": REFUND_STATE,
    "solicitada_at": DATETIME, "completada_at": DATETIME,
}, ["estado", "solicitada_at"]))
add("OrderCancellationResult", obj({
    "pedido_id": UUID, "pedido_estado": ORDER_STATE,
    "pago_estado": string(enum=["pagado", "reembolsado"]),
    "estado": CANCELLATION_STATE, "reembolso_estado": REFUND_STATE,
    "solicitada_at": DATETIME, "completada_at": DATETIME,
}, ["pedido_id", "pedido_estado", "pago_estado", "estado", "solicitada_at"]))
buyer_order["properties"].update({
    "puede_cancelar": boolean(), "cancelacion": ref("OrderCancellationSummary"),
    "totales": ref("MoneyBreakdown"), "direccion_envio_snapshot": ref("AddressSnapshot"),
    "direccion_facturacion_snapshot": ref("AddressSnapshot"), "lineas": array(ref("OrderLine")),
})
buyer_order["required"] += ["puede_cancelar", "totales", "direccion_envio_snapshot", "direccion_facturacion_snapshot", "lineas"]
add("OrderBuyerDetail", buyer_order)
add("SubOrderStatePatch", obj({"estado_destino": SUBORDER_STATE}, ["estado_destino"]))
add("Tracking", obj({
    "transportista": T100, "numero_seguimiento": T100, "fecha_preparacion": DATETIME,
    "fecha_envio": DATETIME, "fecha_entrega_prevista": DATETIME, "fecha_entrega_real": DATETIME,
}))
add("SubOrderSummary", obj({
    "id": UUID, "pedido_id": UUID, "estado": SUBORDER_STATE, "total": MONEY, "moneda": CURRENCY,
    "fecha_ultimo_cambio_estado": DATETIME,
}, ["id", "pedido_id", "estado", "total", "moneda", "fecha_ultimo_cambio_estado"]))
subdetail = merge(schemas["SubOrderSummary"])
subdetail["properties"].update({
    "totales": ref("SubOrderMoneyBreakdown"), "lineas": array(ref("OrderLine")),
    "direccion_envio_snapshot": ref("AddressSnapshot"), "tracking": ref("Tracking"), "pedido_estado": ORDER_STATE,
})
subdetail["required"] += ["totales", "lineas", "direccion_envio_snapshot", "tracking"]
add("SubOrderDetail", subdetail)
admin_order = merge(schemas["OrderSummary"])
admin_order["properties"].update({
    "totales": ref("MoneyBreakdown"), "direccion_envio_snapshot": ref("AddressSnapshot"),
    "direccion_facturacion_snapshot": ref("AddressSnapshot"), "lineas": array(ref("OrderLine")),
    "subpedidos": array(ref("SubOrderDetail")), "comprador_id": UUID,
})
admin_order["required"] += [
    "totales", "direccion_envio_snapshot", "direccion_facturacion_snapshot", "lineas",
    "subpedidos", "comprador_id",
]
add("OrderAdminDetail", admin_order)
add("DashboardSales", obj({"importe": MONEY, "moneda": CURRENCY, "num_pedidos": integer(minimum=0)}, ["importe", "moneda", "num_pedidos"]))
add("Dashboard", obj({"ventas_dia": ref("DashboardSales"), "pedidos_pendientes": integer(minimum=0)}, ["ventas_dia", "pedidos_pendientes"]))
add("WebhookAck", obj({
    "event_id": T200, "status": string(enum=["processed", "duplicate", "ignored"]), "pedido_id": UUID,
    "pago_estado": PAYMENT_STATE, "pedido_estado": ORDER_STATE,
}, ["event_id", "status"]))

add("IncidentStatePatch", obj({"estado_destino": INCIDENT_STATE}, ["estado_destino"]))
add("RelatedResource", obj({"tipo": string(enum=["pedido", "subpedido", "bodega", "vino"]), "id": UUID}, ["tipo", "id"]))
add("IncidentSummary", obj({
    "id": UUID, "tipo": T100, "estado": INCIDENT_STATE, "fecha": DATETIME,
    "recurso_relacionado": ref("RelatedResource"),
}, ["id", "tipo", "estado", "fecha", "recurso_relacionado"]))
incident_detail = merge(schemas["IncidentSummary"])
incident_detail["properties"].update({"descripcion": T5000, "updated_at": DATETIME})
incident_detail["required"] += ["descripcion", "updated_at"]
add("IncidentDetail", incident_detail)


def page_schema(item):
    return obj({
        "items": array(ref(item), max_items=100), "page": integer(minimum=1), "page_size": integer(minimum=1, maximum=100),
        "total_items": integer(minimum=0), "total_pages": integer(minimum=0),
    }, ["items", "page", "page_size", "total_items", "total_pages"])


for page_name, item in [
    ("PageBodegaAdminSummary", "BodegaAdminSummary"), ("PageWineSummary", "WineSummary"),
    ("PageWineOwnSummary", "WineOwnSummary"), ("PageWineAdminSummary", "WineAdminSummary"),
    ("PageOrderSummary", "OrderSummary"), ("PageSubOrderSummary", "SubOrderSummary"),
    ("PageIncidentSummary", "IncidentSummary"),
]:
    add(page_name, page_schema(item))


def schema_example(schema, depth=0, seen=()):
    if depth > 8:
        return {}
    if "$ref" in schema:
        name = schema["$ref"].split("/")[-1]
        special = {
            "AuthSession": {"access_token": "A" * 43, "token_type": "Bearer", "expires_in": 28800, "expires_at": "2026-07-13T12:00:00Z", "usuario": {"id": "11111111-1111-4111-8111-111111111111", "email": "usuario@example.com", "rol": "comprador", "idioma": "es", "estado": "activo"}},
            "MoneyBreakdown": {"subtotal": "10.00", "gastos_envio": "2.00", "impuestos": "2.10", "descuentos": "1.00", "total": "13.10", "moneda": "EUR"},
            "SubOrderMoneyBreakdown": {"subtotal": "10.00", "gastos_envio": "2.00", "impuestos": "2.10", "total": "14.10", "moneda": "EUR"},
            "OrderConfirmation": {"pedido_id": "11111111-1111-4111-8111-111111111111", "numero_pedido": "TER-2026-0001", "pago_estado": "pagado", "pedido_estado": "pagado", "confirmado_at": "2026-07-13T12:00:00Z"},
            "OrderCancellationResult": {"pedido_id": "11111111-1111-4111-8111-111111111111", "pedido_estado": "cancelado", "pago_estado": "reembolsado", "estado": "completada", "reembolso_estado": "succeeded", "solicitada_at": "2026-07-17T10:00:00Z", "completada_at": "2026-07-17T10:00:05Z"},
        }
        if name in special:
            return deepcopy(special[name])
        if name in seen:
            return {}
        return schema_example(schemas[name], depth + 1, (*seen, name))
    if "const" in schema:
        return schema["const"]
    if "enum" in schema:
        return schema["enum"][0]
    if "oneOf" in schema:
        return schema_example(schema["oneOf"][0], depth + 1, seen)
    t = schema.get("type")
    if t == "object":
        required = list(schema.get("required", []))
        if schema.get("minProperties", 0) > 0 and not required and schema.get("properties"):
            required = [next(iter(schema["properties"]))]
        return {k: schema_example(v, depth + 1, seen) for k, v in schema.get("properties", {}).items() if k in required}
    if t == "array":
        return [schema_example(schema["items"], depth + 1, seen)] if schema.get("minItems", 0) > 0 else []
    if t == "integer":
        return schema.get("minimum", 1)
    if t == "boolean":
        return True
    if t == "string":
        fmt = schema.get("format")
        if fmt == "uuid": return "11111111-1111-4111-8111-111111111111"
        if fmt == "date": return "1990-01-01"
        if fmt == "date-time": return "2026-07-13T12:00:00Z"
        if fmt == "email": return "usuario@example.com"
        if fmt == "uri": return "https://example.com/recurso"
        pat = schema.get("pattern", "")
        if pat == r"^[A-Za-z0-9+/]{43}=$": return "A" * 43 + "="
        if "43" in pat: return "A" * 43
        if "0-9" in pat and "\\." in pat: return "10.00"
        return "a" * max(schema.get("minLength", 0), 5)
    return {}


def media(schema):
    sch = ref(schema) if isinstance(schema, str) else schema
    return {"schema": sch, "examples": {"success": {"value": schema_example(sch)}}}


def success_response(description, schema=None):
    out = {"description": description, "headers": {"X-Request-Id": {"$ref": "#/components/headers/XRequestId"}}}
    if schema is not None:
        out["content"] = {"application/json": media(schema)}
    return out


ERROR_CODES = {
    400: "VALIDATION_ERROR", 401: "AUTHENTICATION_REQUIRED", 403: "FORBIDDEN", 404: "RESOURCE_NOT_FOUND",
    409: "CONFLICT", 410: "TOKEN_EXPIRED", 422: "UNSUPPORTED_STRIPE_EVENT", 429: "RATE_LIMITED",
    500: "INTERNAL_ERROR", 502: "UPSTREAM_ERROR", 503: "SERVICE_UNAVAILABLE",
}


def error_response(status):
    code = ERROR_CODES[status]
    out = {
        "description": code.replace("_", " ").title(),
        "headers": {"X-Request-Id": {"$ref": "#/components/headers/XRequestId"}},
        "content": {"application/problem+json": {
            "schema": ref("Problem"),
            "examples": {"error": {"value": {
                "type": f"https://teralya.es/problems/{code.lower().replace('_', '-')}",
                "title": code.replace("_", " ").title(), "status": status,
                "detail": "La solicitud no pudo completarse.", "code": code,
                "request_id": "11111111-1111-4111-8111-111111111111", "retryable": status in (429, 502, 503),
            }}},
        }},
    }
    if status == 401:
        out["headers"]["WWW-Authenticate"] = {
            "description": "Desafío Bearer según RFC 6750",
            "schema": {"type": "string", "const": "Bearer"},
        }
    return out


def param(name, where, schema, required=False, description=None, example=None):
    out = {"name": name, "in": where, "required": required, "schema": schema}
    if description: out["description"] = description
    out["example"] = example if example is not None else schema_example(schema)
    return out


PAGE_PARAMS = [
    param("page", "query", integer(minimum=1, default=1), False, "Página, desde 1", 1),
    param("page_size", "query", integer(minimum=1, maximum=100, default=20), False, "Elementos por página", 20),
]


OPS = []


def op(code, method, path, tag, summary, success, response_schema=None, errors=(), request=None,
       public=False, params=(), success_status=None, description=None):
    OPS.append({
        "code": code, "method": method.lower(), "path": path, "tag": tag, "summary": summary,
        "success": success_status or (201 if method.upper() == "POST" and code in (1, 5, 7, 43, 48) else 200),
        "response_schema": response_schema, "errors": list(errors), "request": request,
        "public": public, "params": list(params), "description": description,
    })


idp = lambda name="id": param(name, "path", UUID, True, f"Identificador {name}")

op(1,"POST","/auth/registro/comprador","Autenticación","Registrar comprador",201,"AuthSession",[400,409,500],"RegisterBuyerRequest",True)
op(2,"POST","/auth/login","Autenticación","Iniciar sesión",200,"AuthSession",[400,401,403,429,500],"LoginRequest",True)
op(3,"POST","/auth/recuperar-password","Autenticación","Solicitar recuperación",200,"GenericAck",[400,429,500],"PasswordRecoveryRequest",True)
op(4,"POST","/auth/restablecer-password","Autenticación","Restablecer contraseña",200,"GenericAck",[400,404,409,500],"PasswordResetRequest",True)
op(5,"POST","/bodegas","Bodegas","Solicitar registro de bodega",201,"BodegaSelf",[400,409,500],"BodegaRegistrationRequest",True)
op(6,"PATCH","/bodegas/yo/perfil","Bodegas","Actualizar perfil propio",200,"BodegaSelf",[400,401,403,409,500],"BodegaProfilePatch")
op(7,"POST","/bodegas/yo/vinos","Vinos","Crear vino",201,"WineOwnDetail",[400,401,403,409,500],"WineCreateRequest")
op(8,"PUT","/bodegas/yo/vinos/{id}","Vinos","Reemplazar vino propio",200,"WineOwnDetail",[400,401,403,404,409,500],"WineUpdateRequest",params=[idp()])
catalog_params = [
    param("q","query",string(minLength=1,maxLength=120)), param("tipo_vino","query",T80),
    param("region","query",T160), param("denominacion_origen","query",T160),
    param("precio_min","query",MONEY), param("precio_max","query",MONEY), *PAGE_PARAMS,
]
op(9,"GET","/vinos","Vinos","Consultar catálogo",200,"PageWineSummary",[400,500],public=True,params=catalog_params)
op(10,"GET","/vinos/{id}","Vinos","Consultar ficha de vino",200,"WinePublicDetail",[404,500],public=True,params=[idp()])
op(11,"POST","/carrito/items","Carrito","Añadir o fusionar carrito",200,"CartMutationResponse",[400,401,404,409,500],"CartRequest")
op(12,"GET","/carrito","Carrito","Consultar carrito",200,"Cart",[401,404,500])
op(13,"PATCH","/carrito/items/{id}","Carrito","Modificar cantidad",200,"Cart",[400,401,404,409,500],"QuantityPatchRequest",params=[idp()])
op(14,"DELETE","/carrito/items/{id}","Carrito","Eliminar línea",200,"Cart",[401,404,500],params=[idp()])
op(15,"DELETE","/carrito","Carrito","Vaciar carrito",200,"Cart",[401,500])
op(16,"POST","/checkout","Checkout","Preparar Pedido",200,"OrderPrepared",[400,401,403,404,409,500],"CheckoutRequest")
op(17,"POST","/checkout/pago","Checkout","Crear o reutilizar sesión Stripe",200,"CheckoutSession",[400,401,404,409,502,503],"CheckoutSessionRequest")
op(18,"GET","/checkout/confirmacion/{pedido_id}","Checkout","Consultar confirmación",200,"OrderConfirmation",[401,404,500],params=[idp("pedido_id")])
op(19,"GET","/pedidos","Pedidos","Listar Pedidos propios",200,"PageOrderSummary",[400,401,500],params=PAGE_PARAMS)
op(20,"GET","/pedidos/{id}","Pedidos","Consultar Pedido propio",200,"OrderBuyerDetail",[401,403,404,500],params=[idp()])
op(21,"GET","/bodegas/yo/subpedidos","SubPedidos","Listar SubPedidos propios",200,"PageSubOrderSummary",[400,401,403,500],params=PAGE_PARAMS)
op(22,"GET","/bodegas/yo/subpedidos/{id}","SubPedidos","Consultar SubPedido propio",200,"SubOrderDetail",[401,403,404,500],params=[idp()])
op(23,"PATCH","/bodegas/yo/subpedidos/{id}/estado","SubPedidos","Cambiar estado de SubPedido",200,"SubOrderDetail",[400,401,403,404,409,500],"SubOrderStatePatch",params=[idp()])
op(24,"POST","/admin/bodegas/{id}/validar","Administración","Validar bodega",200,"BodegaAdmin",[400,401,403,404,409,500],params=[idp()])
op(25,"POST","/admin/vinos/{id}/publicar","Administración","Publicar vino",200,"WineAdminDetail",[400,401,403,404,409,500],params=[idp()])
op(26,"POST","/admin/vinos/{id}/despublicar","Administración","Despublicar vino",200,"WineAdminDetail",[401,403,404,409,500],params=[idp()])
op(27,"GET","/admin/pedidos","Administración","Listar Pedidos",200,"PageOrderSummary",[400,401,403,500],params=PAGE_PARAMS)
op(28,"GET","/admin/dashboard","Administración","Consultar dashboard",200,"Dashboard",[401,403,500])
stripe_header = param("Stripe-Signature","header",string(minLength=1,maxLength=2048),True,"Firma Stripe sobre body crudo","t=1,v1=firma")
op(29,"POST","/sistema/webhooks/stripe","Sistema","Procesar webhook Stripe",200,"WebhookAck",[400,404,409,422,500],"StripeEvent",True,params=[stripe_header])
op(30,"GET","/bodegas/{id}","Bodegas","Consultar bodega pública",200,"BodegaPublic",[404,500],public=True,params=[idp()])
op(31,"GET","/bodegas/yo/perfil","Bodegas","Consultar perfil propio",200,"BodegaSelf",[401,403,404,500])
ownwine_params=[param("estado","query",WINE_STATE),*PAGE_PARAMS]
op(32,"GET","/bodegas/yo/vinos","Vinos","Listar vinos propios",200,"PageWineOwnSummary",[400,401,403,500],params=ownwine_params)
op(33,"GET","/bodegas/yo/vinos/{id}","Vinos","Consultar vino propio",200,"WineOwnDetail",[401,403,404,500],params=[idp()])
op(34,"POST","/bodegas/yo/vinos/{id}/solicitar-publicacion","Vinos","Solicitar publicación",200,"WineOwnDetail",[400,401,403,404,409,500],params=[idp()])
pending_winery=[param("estado","query",{"type":"string","const":"pendiente"},True,"Alias wire; se mapea a pendiente_revision","pendiente"),*PAGE_PARAMS]
op(35,"GET","/admin/bodegas","Administración","Listar bodegas pendientes",200,"PageBodegaAdminSummary",[400,401,403,500],params=pending_winery)
op(36,"GET","/admin/bodegas/{id}","Administración","Consultar bodega administrativa",200,"BodegaAdmin",[401,403,404,500],params=[idp()])
pending_wine=[param("estado","query",{"type":"string","const":"pendiente_revision"},True,example="pendiente_revision"),*PAGE_PARAMS]
op(37,"GET","/admin/vinos","Administración","Listar vinos pendientes",200,"PageWineAdminSummary",[400,401,403,500],params=pending_wine)
op(38,"GET","/admin/vinos/{id}","Administración","Consultar vino administrativo",200,"WineAdminDetail",[401,403,404,500],params=[idp()])
op(39,"GET","/admin/pedidos/{id}","Administración","Consultar Pedido administrativo",200,"OrderAdminDetail",[401,403,404,500],params=[idp()])
incident_params=[param("estado","query",INCIDENT_STATE),*PAGE_PARAMS]
op(40,"GET","/admin/incidencias","Administración","Listar incidencias",200,"PageIncidentSummary",[400,401,403,500],params=incident_params)
op(41,"GET","/admin/incidencias/{id}","Administración","Consultar incidencia",200,"IncidentDetail",[401,403,404,500],params=[idp()])
op(42,"PATCH","/admin/incidencias/{id}","Administración","Actualizar incidencia",200,"IncidentDetail",[400,401,403,404,409,500],"IncidentStatePatch",params=[idp()])
idem_header=param("Idempotency-Key","header",UUID,True,"UUID reutilizado como direccion.id")
op(43,"POST","/direcciones","Direcciones","Crear dirección propia",201,"Address",[400,401,403,409,500],"AddressCreateRequest",params=[idem_header])
op(44,"GET","/direcciones","Direcciones","Consultar direcciones propias",200,{"type":"array","items":ref("Address")},[400,401,403,500],params=[param("uso","query",string(enum=["envio","facturacion","ambos"]))])
op(45,"PATCH","/direcciones/{id}","Direcciones","Actualizar dirección propia",200,"Address",[400,401,403,404,409,500],"AddressPatchRequest",params=[idp()])
op(46,"DELETE","/direcciones/{id}","Direcciones","Desactivar dirección propia",204,None,[401,403,404,409,500],params=[idp()],success_status=204)
op(47,"POST","/bodegas/yo/vinos/{id}/imagenes/upload-url","Imágenes","Solicitar URL de carga",200,"UploadAuthorization",[400,401,403,404,409,500],"UploadRequest",params=[idp()])
op(48,"POST","/bodegas/yo/vinos/{id}/imagenes","Imágenes","Confirmar imagen cargada",201,"Image",[400,401,403,404,409,410,500],"ImageConfirmRequest",params=[idp()])
op(49,"PATCH","/bodegas/yo/vinos/{id}/imagenes/{imagen_id}","Imágenes","Actualizar metadatos de imagen",200,"Image",[400,401,403,404,409,500],"ImagePatchRequest",params=[idp(),idp("imagen_id")])
op(50,"DELETE","/bodegas/yo/vinos/{id}/imagenes/{imagen_id}","Imágenes","Desactivar imagen",204,None,[401,403,404,409,500],params=[idp(),idp("imagen_id")],success_status=204)
op(51,"POST","/pedidos/{id}/cancelacion","Pedidos","Cancelar Pedido propio",200,"OrderCancellationResult",[401,403,404,409,500,502,503],params=[idp()])

add("StripeEvent", {
    "type": "object", "additionalProperties": True,
    "description": "Evento externo Stripe recibido como body crudo; la firma se valida antes de interpretar JSON.",
    "properties": {
        "id": string(minLength=1, maxLength=200),
        "type": string(enum=["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"]),
        "livemode": boolean(),
        "data": {
            "type": "object", "additionalProperties": True, "required": ["object"],
            "properties": {"object": {
                "type": "object", "additionalProperties": True,
                "required": ["id", "payment_status", "amount_total", "currency", "metadata"],
                "properties": {
                    "id": string(minLength=1, maxLength=200),
                    "payment_status": string(enum=["paid", "unpaid", "no_payment_required"]),
                    "amount_total": integer(minimum=0), "currency": {"type": "string", "const": "eur"},
                    "metadata": obj({"pedido_id": UUID, "pago_id": UUID}, ["pedido_id", "pago_id"]),
                },
            }},
        },
    },
    "required": ["id", "type", "livemode", "data"],
})

STRIPE_EXAMPLE_BASE = {
    "id": "evt_teralya_001", "livemode": True,
    "data": {"object": {
        "id": "cs_teralya_001", "payment_status": "paid", "amount_total": 1310, "currency": "eur",
        "metadata": {"pedido_id": "11111111-1111-4111-8111-111111111111", "pago_id": "22222222-2222-4222-8222-222222222222"},
    }},
}

def stripe_examples():
    out = {}
    for label, event_type, payment_status in [
        ("completed_paid", "checkout.session.completed", "paid"),
        ("async_succeeded", "checkout.session.async_payment_succeeded", "paid"),
        ("async_failed", "checkout.session.async_payment_failed", "unpaid"),
        ("expired", "checkout.session.expired", "unpaid"),
    ]:
        value = deepcopy(STRIPE_EXAMPLE_BASE)
        value["id"] = f"evt_{label}"
        value["type"] = event_type
        value["data"]["object"]["payment_status"] = payment_status
        out[label] = {"value": value}
    return out

TRACE = {
    1: (["CU-001"], ["PT-ACC-001"]),
    2: (["CU-002", "CU-013", "CU-020"], ["PT-ACC-003", "PT-BOD-001", "PT-ADM-001", "PT-SIS-003"]),
    3: (["CU-003"], ["PT-ACC-004"]), 4: (["CU-003"], ["PT-ACC-005"]),
    5: (["CU-012"], ["PT-ACC-002"]), 6: (["CU-014", "CU-034"], ["PT-BOD-002"]),
    7: (["CU-015"], ["PT-BOD-004"]), 8: (["CU-016"], ["PT-BOD-005"]),
    9: (["CU-004", "CU-005"], ["PT-PUB-002"]), 10: (["CU-006"], ["PT-PUB-003"]),
    11: (["CU-002", "CU-007", "CU-008"], ["PT-ACC-001", "PT-ACC-003", "PT-COM-002"]),
    12: (["CU-008"], ["PT-COM-002"]), 13: (["CU-008"], ["PT-COM-002"]),
    14: (["CU-008"], ["PT-COM-002"]), 15: (["CU-008"], ["PT-COM-002"]),
    16: (["CU-009"], ["PT-COM-003"]), 17: (["CU-010"], ["PT-COM-004"]),
    18: (["CU-010", "CU-028"], ["PT-COM-005"]), 19: (["CU-011"], ["PT-COM-006"]),
    20: (["CU-011"], ["PT-COM-007"]), 21: (["CU-018"], ["PT-BOD-007"]),
    22: (["CU-018"], ["PT-BOD-008"]),
    23: (["CU-019", "CU-030"], ["PT-BOD-008", "PT-COM-007", "PT-ADM-007"]),
    24: (["CU-021"], ["PT-ADM-002", "PT-ADM-003"]),
    25: (["CU-023"], ["PT-ADM-004", "PT-ADM-005"]),
    26: (["CU-024"], ["PT-ADM-004", "PT-ADM-005"]),
    27: (["CU-025"], ["PT-ADM-006", "PT-ADM-007"]), 28: (["CU-026"], ["PT-ADM-001"]),
    29: (["CU-028", "CU-029"], []), 30: (["CU-006", "CU-034"], ["PT-PUB-004"]),
    31: (["CU-014", "CU-034"], ["PT-BOD-002"]),
    32: (["CU-015", "CU-016", "CU-017"], ["PT-BOD-003"]),
    33: (["CU-015", "CU-016", "CU-017"], ["PT-BOD-006"]),
    34: (["CU-017"], ["PT-BOD-003", "PT-BOD-005", "PT-BOD-006", "PT-ADM-004"]),
    35: (["CU-021"], ["PT-ADM-002"]), 36: (["CU-021"], ["PT-ADM-003"]),
    37: (["CU-022", "CU-023", "CU-024"], ["PT-ADM-004"]),
    38: (["CU-022", "CU-023", "CU-024"], ["PT-ADM-005"]),
    39: (["CU-025"], ["PT-ADM-007"]), 40: (["CU-027"], ["PT-ADM-008"]),
    41: (["CU-027"], ["PT-ADM-009"]), 42: (["CU-027"], ["PT-ADM-008", "PT-ADM-009"]),
    43: (["CU-009", "CU-014"], ["PT-COM-003", "PT-BOD-002"]),
    44: (["CU-009", "CU-014"], ["PT-COM-003", "PT-BOD-002"]),
    45: (["CU-009", "CU-014"], ["PT-COM-003", "PT-BOD-002"]),
    46: (["CU-009", "CU-014"], ["PT-COM-003", "PT-BOD-002"]),
    47: (["CU-016"], ["PT-BOD-005"]), 48: (["CU-016"], ["PT-BOD-005"]),
    49: (["CU-016"], ["PT-BOD-005"]),
    50: (["CU-016", "CU-017", "CU-022", "CU-023"], ["PT-BOD-005", "PT-ADM-005"]),
    51: (["CU-033"], ["PT-COM-007"]),
}

SEMANTICS = {
    3: "Respuesta genérica anti-enumeración: no revela si el correo existe.",
    11: "Fusiona el carrito local identificado por fusion_id de forma idempotente; reintentos devuelven el mismo resultado.",
    16: "Crea como máximo un Pedido pendiente_pago por carrito y congela únicamente las direcciones en snapshots inmutables. Las líneas y precios se congelan al confirmar el pago en API-029.",
    17: "Reutiliza una sesión Stripe vigente; si expiró o fue cancelada, crea sustituta y reactiva el pago cancelado a pendiente.",
    23: "Matriz permitida: pendiente→aceptado|cancelado|incidencia; aceptado→en_preparacion|cancelado|incidencia; en_preparacion→enviado|cancelado|incidencia; incidencia→en_preparacion|cancelado; enviado→entregado. Entregado y cancelado son terminales; mismo estado es idempotente. El cambio y el recálculo de Pedido son atómicos bajo bloqueo. Derivación: todos los no cancelados pendientes→pagado; ninguno enviado/entregado y alguno aceptado/en_preparacion/incidencia→en_preparacion; mezcla de enviado/entregado con estados previos→parcialmente_enviado; todos los no cancelados enviado/entregado y alguno enviado→enviado; todos los no cancelados entregado→entregado; todos cancelados→cancelado.",
    25: "Publica solo si el vino está exactamente en pendiente_revision, su bodega está validada y tiene nombre, precio positivo en EUR, stock_disponible > 0, disponible_venta=true y al menos una imagen confirmada y activa con alt_text.",
    29: "Valida Stripe-Signature sobre el body crudo con tolerancia máxima de 300 segundos. Allowlist: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed y checkout.session.expired. event.id es la clave del ledger; livemode, Session ID, metadata pedido_id/pago_id, currency=eur e importe en céntimos deben coincidir. completed con payment_status=paid y async_payment_succeeded confirman atómicamente Pago/Pedido, conservan snapshots, congelan líneas/precios, aplican stock y crean un SubPedido por Pedido–Bodega; completed no pagado no tiene efecto comercial; async_payment_failed marca Pago fallido y expired lo marca cancelado, sin stock ni SubPedidos. Reenvíos devuelven el resultado persistido.",
    34: "Solicita revisión solo para un vino propio en estado inicial no publicado, de una bodega validada, con nombre, precio positivo en EUR, stock_disponible > 0, disponible_venta=true y al menos una imagen confirmada y activa con alt_text; publicado o pendiente_revision devuelve 409.",
    35: "El valor wire estado=pendiente es un alias normativo que se mapea internamente a pendiente_revision.",
    43: "Idempotencia por Idempotency-Key: la primera creación responde 201, un replay idéntico 200 y una reutilización conflictiva 409.",
    46: "Desactivación idempotente: la primera ejecución y sus replays válidos responden 204.",
    47: "Emite URL prefirmada con TTL de 10 minutos y token de confirmación con TTL de 30 minutos, ligados a upload_id, clave, MIME, tamaño, checksum, vino y propietario.",
    48: "Dentro del TTL de confirmación de 30 minutos, confirma mediante HEAD que clave, MIME, Content-Length y checksum coinciden con la autorización; registra la imagen y publica su URL CDN estable. Primera confirmación 201, replay idéntico 200.",
    50: "Desactivación idempotente. Impide eliminar la última imagen activa con 409; los replays válidos responden 204.",
    51: "Cancela un Pedido propio cobrado solo antes de expedición, entrega o incidencia. Bloquea Pedido, Pago y SubPedidos; usa un ledger único y reintentos idempotentes de Stripe. Solo al confirmar el reembolso cancela Pedido/SubPedidos/líneas, restituye stock una vez, marca Pago reembolsado, audita y envía confirmación por email. Un reembolso pendiente bloquea transiciones logísticas y uno fallido puede reintentarse con nueva clave idempotente.",
}

paths = {}
for x in OPS:
    cu, pt = TRACE[x["code"]]
    operation = {
        "operationId": f"api{x['code']:03d}", "x-teralya-api-code": f"API-{x['code']:03d}",
        "x-teralya-cu": cu, "x-teralya-pt": pt,
        "tags": [x["tag"]], "summary": x["summary"],
        "description": x["description"] or SEMANTICS.get(x["code"], f"Contrato normativo de API-{x['code']:03d}."),
        "security": [] if x["public"] else [{"BearerOpaque": []}],
        "responses": {},
    }
    if x["params"]:
        operation["parameters"] = x["params"]
    if x["request"]:
        operation["requestBody"] = {
            "required": True,
            "content": {"application/json": media(x["request"])},
        }
        if x["code"] == 29:
            operation["requestBody"]["content"]["application/json"]["examples"] = stripe_examples()
    if x["code"] == 29:
        operation["x-raw-body-required"] = True
    status = str(x["success"])
    operation["responses"][status] = success_response("Operación completada", x["response_schema"])
    if x["code"] in (25, 34):
        value = operation["responses"][status]["content"]["application/json"]["examples"]["success"]["value"]
        value["estado"] = "publicado" if x["code"] == 25 else "pendiente_revision"
        value["stock_disponible"] = 10
        value["disponible_venta"] = True
        value["imagenes"] = [{
            "id": "33333333-3333-4333-8333-333333333333", "url": "https://cdn.teralya.es/vinos/imagen.webp",
            "es_principal": True, "orden": 0, "alt_text": "Botella de vino Teralya", "resolucion": "1200x1600",
        }]
        if x["code"] == 25:
            value["bodega"]["estado"] = "activa"
    if x["code"] == 47:
        value = operation["responses"][status]["content"]["application/json"]["examples"]["success"]["value"]
        value["upload_expires_at"] = "2026-07-13T12:10:00Z"
        value["confirmation_expires_at"] = "2026-07-13T12:30:00Z"
    if x["code"] in (43, 48):
        operation["responses"]["200"] = success_response("Replay idempotente", x["response_schema"])
    for e in x["errors"]:
        operation["responses"][str(e)] = error_response(e)
    paths.setdefault(x["path"], {})[x["method"]] = operation

spec = {
    "openapi": "3.1.0",
    "jsonSchemaDialect": "https://json-schema.org/draft/2020-12/schema",
    "info": {
        "title": "Teralya API", "version": "1.1.0",
        "description": "Contrato OpenAPI 3.1 del MVP. Derivado de INF-08 v2.6, INF-10 v1.1 e INF-10-A v1.1.",
        "contact": {"name": "Teralya", "url": "https://teralya.es"},
        "license": {"name": "Propietario — Teralya", "identifier": "LicenseRef-Teralya-Proprietary"},
    },
    "servers": [{"url": "https://api.teralya.es", "description": "Producción"}],
    "tags": [
        {"name": "Autenticación", "description": "Registro, acceso y recuperación de credenciales."},
        {"name": "Bodegas", "description": "Alta, perfil y consulta pública de bodegas."},
        {"name": "Vinos", "description": "Catálogo y gestión del ciclo de vida del vino."},
        {"name": "Carrito", "description": "Gestión y fusión idempotente del carrito de compra."},
        {"name": "Checkout", "description": "Preparación del Pedido, pago y confirmación."},
        {"name": "Pedidos", "description": "Consulta y cancelación contractual de Pedidos del comprador."},
        {"name": "SubPedidos", "description": "Operativa logística propia de cada bodega."},
        {"name": "Administración", "description": "Revisión, publicación, Pedidos e incidencias administrativas."},
        {"name": "Sistema", "description": "Integraciones internas y webhooks firmados."},
        {"name": "Direcciones", "description": "Gestión idempotente de direcciones propias."},
        {"name": "Imágenes", "description": "Carga directa a S3 y gestión de imágenes de vino."},
    ],
    "paths": paths,
    "components": {
        "securitySchemes": {"BearerOpaque": {"type": "http", "scheme": "bearer", "description": "Token opaco de 256 bits; TTL absoluto 8 horas."}},
        "headers": {"XRequestId": {"description": "Identificador UUID de trazabilidad", "schema": UUID}},
        "schemas": schemas,
    },
}

OUT.write_text(yaml.safe_dump(spec, sort_keys=False, allow_unicode=True, width=120), encoding="utf-8")
print(f"wrote {OUT} with {len(OPS)} operations, {len(paths)} paths and {len(schemas)} schemas")
