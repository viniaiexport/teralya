locals {
  name = "${var.project}-${var.environment}"
  labels = merge({
    project     = var.project
    environment = var.environment
    managed_by  = "terraform"
    role        = "app-data-pilot"
  }, var.extra_labels)

  cloudflare_ips = concat(
    jsondecode(data.http.cloudflare_ips.response_body).result.ipv4_cidrs,
    jsondecode(data.http.cloudflare_ips.response_body).result.ipv6_cidrs,
  )
}

data "http" "cloudflare_ips" {
  url = "https://api.cloudflare.com/client/v4/ips"

  request_headers = {
    Accept = "application/json"
  }

  lifecycle {
    postcondition {
      condition     = self.status_code == 200
      error_message = "No se pudo obtener la lista oficial de redes de Cloudflare."
    }
  }
}

resource "hcloud_network" "private" {
  name     = "${local.name}-private"
  ip_range = "10.42.0.0/16"
  labels   = local.labels
}

resource "hcloud_network_subnet" "private" {
  network_id   = hcloud_network.private.id
  type         = "cloud"
  network_zone = "eu-central"
  ip_range     = "10.42.1.0/24"
}

resource "hcloud_ssh_key" "operator" {
  name       = "${local.name}-operator"
  public_key = trimspace(var.ssh_public_key)
  labels     = local.labels
}

resource "hcloud_firewall" "edge" {
  name   = "${local.name}-edge"
  labels = local.labels

  rule {
    direction   = "in"
    protocol    = "icmp"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "Diagnóstico de red"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips  = var.admin_cidrs
    description = "SSH restringido a operadores"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "80"
    source_ips  = local.cloudflare_ips
    description = "HTTP solo desde Cloudflare"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "443"
    source_ips  = local.cloudflare_ips
    description = "HTTPS solo desde Cloudflare"
  }
}

resource "hcloud_server" "pilot" {
  name        = local.name
  image       = var.server_image
  server_type = var.server_type
  location    = var.location
  backups     = var.enable_server_backups
  ssh_keys    = [hcloud_ssh_key.operator.id]
  firewall_ids = [
    hcloud_firewall.edge.id,
  ]

  delete_protection  = var.protect_server
  rebuild_protection = var.protect_server
  labels             = local.labels

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }

  network {
    subnet_id = hcloud_network_subnet.private.id
    ip        = "10.42.1.10"
    alias_ips = []
  }

  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    ssh_public_key = trimspace(var.ssh_public_key)
  })

  depends_on = [hcloud_network_subnet.private]

  lifecycle {
    ignore_changes = [ssh_keys, user_data]
  }
}
