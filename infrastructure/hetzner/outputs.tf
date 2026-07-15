output "server_id" {
  description = "Identificador del servidor piloto."
  value       = hcloud_server.pilot.id
}

output "server_ipv4" {
  description = "IPv4 que debe configurarse como origen en Cloudflare."
  value       = hcloud_server.pilot.ipv4_address
}

output "server_ipv6" {
  description = "Primera IPv6 asignada al servidor."
  value       = hcloud_server.pilot.ipv6_address
}

output "private_ipv4" {
  description = "Dirección privada reservada para el nodo piloto."
  value       = "10.42.1.10"
}

output "ssh_command" {
  description = "Comando orientativo de acceso."
  value       = "ssh deployer@${hcloud_server.pilot.ipv4_address}"
}

output "cloudflare_dns_command" {
  description = "Comando para crear o actualizar los registros DNS proxied."
  value       = "./infrastructure/cloudflare/configure-dns.sh ${hcloud_server.pilot.ipv4_address}"
}
