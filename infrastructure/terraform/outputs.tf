output "alb_dns_name" {
  value = aws_lb.this.dns_name }
output "api_hostname" {
  value = var.api_hostname }
output "cloudfront_media_domain" {
  value = aws_cloudfront_distribution.media.domain_name }
output "ecr_repository_urls" {
  value = { for k, v in aws_ecr_repository.app : k => v.repository_url } }
output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name }
output "backend_secret_arn" {
  value = aws_secretsmanager_secret.backend.arn }
output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
  sensitive = true }
output "rds_master_secret_arn" {
  value = try(aws_db_instance.postgres.master_user_secret[0].secret_arn, null)
  sensitive = true }
output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive = true }
output "media_bucket" {
  value = aws_s3_bucket.media.id }
