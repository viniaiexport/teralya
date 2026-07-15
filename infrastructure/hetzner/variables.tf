variable "hcloud_token" {
  description = "Token de Hetzner Cloud. Se inyecta mediante TF_VAR_hcloud_token y nunca se versiona."
  type        = string
  sensitive   = true
}

variable "project" {
  description = "Nombre corto del proyecto."
  type        = string
  default     = "teralya"
}

variable "environment" {
  description = "Entorno que se va a crear."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment debe ser staging o production."
  }
}

variable "location" {
  description = "Centro de datos europeo de Hetzner."
  type        = string
  default     = "fsn1"
}

variable "server_type" {
  description = "Tipo de servidor para el piloto. Se amplía verticalmente antes de añadir complejidad."
  type        = string
  default     = "cx23"
}

variable "server_image" {
  description = "Imagen base mantenida por Hetzner."
  type        = string
  default     = "ubuntu-24.04"
}

variable "ssh_public_key" {
  description = "Clave pública SSH del operador. Se instala para el usuario deployer."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp)", trimspace(var.ssh_public_key)))
    error_message = "ssh_public_key debe ser una clave pública SSH válida."
  }
}

variable "admin_cidrs" {
  description = "Direcciones IP autorizadas para SSH. No se permite 0.0.0.0/0 ni ::/0."
  type        = list(string)

  validation {
    condition = (
      length(var.admin_cidrs) > 0 &&
      !contains(var.admin_cidrs, "0.0.0.0/0") &&
      !contains(var.admin_cidrs, "::/0")
    )
    error_message = "admin_cidrs debe contener al menos una red restringida y no puede abrir SSH a todo Internet."
  }
}

variable "enable_server_backups" {
  description = "Activa los backups diarios del disco local de Hetzner. No sustituye las copias PostgreSQL en R2."
  type        = bool
  default     = true
}

variable "protect_server" {
  description = "Protege el servidor frente a borrado o reconstrucción accidental."
  type        = bool
  default     = true
}

variable "extra_labels" {
  description = "Etiquetas adicionales para inventario y costes."
  type        = map(string)
  default     = {}
}
