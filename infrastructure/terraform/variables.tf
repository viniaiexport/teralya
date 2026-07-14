variable "aws_region" {
  type = string
  default = "eu-west-1"

}

variable "project" {
  type = string
  default = "teralya"

}

variable "environment" {
  type = string
  validation {
  condition     = contains(["staging", "production"], var.environment)
    error_message = "environment debe ser staging o production."

}

}
variable "vpc_cidr" {
  type = string
  default = "10.42.0.0/16"

}

variable "availability_zones" {
  type = list(string)
  default = ["eu-west-1a", "eu-west-1b"]

}

variable "frontend_image" {
  type = string
  description = "URI inmutable de imagen frontend (preferentemente digest)."

}

variable "backend_image" {
  type = string
  description = "URI inmutable de imagen backend (preferentemente digest)."

}

variable "api_hostname" {
  type = string
  description = "Host público de la API, por ejemplo api.staging.teralya.es."

}

variable "certificate_arn" {
  type = string
  description = "Certificado ACM regional para el listener HTTPS."

}

variable "frontend_cpu" {
  type = number
  default = 256

}

variable "frontend_memory" {
  type = number
  default = 512

}

variable "backend_cpu" {
  type = number
  default = 512

}

variable "backend_memory" {
  type = number
  default = 1024

}

variable "frontend_desired_count" {
  type = number
  default = 2

}

variable "backend_desired_count" {
  type = number
  default = 2

}

variable "db_instance_class" {
  type = string
  default = "db.t4g.micro"

}

variable "db_allocated_storage" {
  type = number
  default = 20

}

variable "redis_node_type" {
  type = string
  default = "cache.t4g.micro"

}

variable "log_retention_days" {
  type = number
  default = 30

}

variable "deletion_protection" {
  type = bool
  default = true

}

variable "extra_tags" {
  type = map(string)
  default = {}

}
