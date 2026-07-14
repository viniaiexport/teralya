data "aws_caller_identity" "current" {}
locals {
  name = "${var.project}-${var.environment}"
  azs  = slice(var.availability_zones, 0, 2)
  tags = merge({ Project = var.project, Environment = var.environment, ManagedBy = "Terraform" }, var.extra_tags)
  backend_secret_keys = [
    "DATABASE_URL", "PUBLIC_BASE_URL", "STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY",
    "STRIPE_CHECKOUT_SUCCESS_URL", "STRIPE_CHECKOUT_CANCEL_URL", "STRIPE_CHECKOUT_TTL_SECONDS",
    "MINIMUM_PURCHASE_AGE", "ALCOHOL_TERMS_VERSION", "LOGIN_RATE_LIMIT_MAX_ATTEMPTS",
    "LOGIN_RATE_LIMIT_WINDOW_SECONDS", "PASSWORD_RECOVERY_TOKEN_TTL_SECONDS",
    "PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS", "PASSWORD_RECOVERY_RATE_LIMIT_WINDOW_SECONDS",
    "PASSWORD_RECOVERY_URL", "PASSWORD_RECOVERY_FROM_EMAIL", "SMTP_HOST", "SMTP_PORT",
    "SMTP_SECURE", "SMTP_USER", "SMTP_PASSWORD", "IMAGE_CONFIRMATION_HMAC_SECRET"
  ]

}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = local.name }

}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = { Name = local.name }

}
resource "aws_subnet" "public" {
  for_each                = { for i, az in local.azs : az => i }
  vpc_id                  = aws_vpc.this.id
  availability_zone       = each.key
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, each.value)
  map_public_ip_on_launch = false
  tags                    = { Name = "${local.name}-public-${each.key}", Tier = "public" }

}

resource "aws_subnet" "private" {
  for_each          = { for i, az in local.azs : az => i }
  vpc_id            = aws_vpc.this.id
  availability_zone = each.key
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, each.value + 8)
  tags              = { Name = "${local.name}-private-${each.key}", Tier = "private" }

}

resource "aws_eip" "nat" {
  for_each = aws_subnet.public
  domain = "vpc"
  tags = { Name = "${local.name}-nat-${each.key}" }

}

resource "aws_nat_gateway" "this" {
  for_each      = aws_subnet.public
  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = each.value.id
  depends_on    = [aws_internet_gateway.this]
  tags          = { Name = "${local.name}-${each.key}" }

}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  tags = { Name = "${local.name}-public" }

}

resource "aws_route" "public" {
  route_table_id = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.this.id

}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public
  subnet_id = each.value.id
  route_table_id = aws_route_table.public.id

}

resource "aws_route_table" "private" {
  for_each = aws_subnet.private
  vpc_id = aws_vpc.this.id
  tags = { Name = "${local.name}-private-${each.key}" }

}

resource "aws_route" "private" {
  for_each = aws_route_table.private
  route_table_id = each.value.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.this[each.key].id

}

resource "aws_route_table_association" "private" {
  for_each = aws_subnet.private
  subnet_id = each.value.id
  route_table_id = aws_route_table.private[each.key].id

}
resource "aws_security_group" "alb" {
  name = "${local.name}-alb"
  vpc_id = aws_vpc.this.id
  ingress {
  description = "HTTPS"
  from_port = 443
  to_port = 443
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
ingress {
  description = "HTTP redirect"
  from_port = 80
  to_port = 80
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
egress {
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = ["0.0.0.0/0"]

}
}
resource "aws_security_group" "frontend" {
  name = "${local.name}-frontend"
  vpc_id = aws_vpc.this.id
  ingress {
  description = "ALB"
  from_port = 3000
  to_port = 3000
  protocol = "tcp"
  security_groups = [aws_security_group.alb.id]
}
egress {
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = ["0.0.0.0/0"]

}
}
resource "aws_security_group" "backend" {
  name = "${local.name}-backend"
  vpc_id = aws_vpc.this.id
  ingress {
  description = "ALB"
  from_port = 3001
  to_port = 3001
  protocol = "tcp"
  security_groups = [aws_security_group.alb.id]
}
ingress {
  description = "Frontend SSR"
  from_port = 3001
  to_port = 3001
  protocol = "tcp"
  security_groups = [aws_security_group.frontend.id]
}
egress {
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = ["0.0.0.0/0"]

}
}
resource "aws_security_group" "data" {
  name = "${local.name}-data"
  vpc_id = aws_vpc.this.id
  ingress {
  description = "PostgreSQL from backend"
  from_port = 5432
  to_port = 5432
  protocol = "tcp"
  security_groups = [aws_security_group.backend.id]
}
ingress {
  description = "Redis from backend"
  from_port = 6379
  to_port = 6379
  protocol = "tcp"
  security_groups = [aws_security_group.backend.id]
}
egress {
  from_port = 0
  to_port = 0
  protocol = "-1"
  cidr_blocks = ["0.0.0.0/0"]

}
}

resource "aws_lb" "this" {
  name = substr(local.name, 0, 32)
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.alb.id]
  subnets = values(aws_subnet.public)[*].id
  enable_deletion_protection = var.deletion_protection

}
resource "aws_lb_target_group" "frontend" {
  name = substr("${local.name}-fe", 0, 32)
  port = 3000
  protocol = "HTTP"
  vpc_id = aws_vpc.this.id
  target_type = "ip"
  health_check {
  path = "/"
  matcher = "200-399"

}
}

resource "aws_lb_target_group" "backend" {
  name = substr("${local.name}-be", 0, 32)
  port = 3001
  protocol = "HTTP"
  vpc_id = aws_vpc.this.id
  target_type = "ip"
  health_check {
  path = "/health/ready"
  matcher = "200"

}
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port = 443
  protocol = "HTTPS"
  certificate_arn = var.certificate_arn
  ssl_policy = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  default_action {
  type = "forward"
  target_group_arn = aws_lb_target_group.frontend.arn

}
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port = 80
  protocol = "HTTP"
  default_action {
  type = "redirect"
  redirect {
  port = "443"
  protocol = "HTTPS"
  status_code = "HTTP_301"

}
}
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority = 10
  action {
  type = "forward"
  target_group_arn = aws_lb_target_group.backend.arn
}
condition {
  host_header { values = [var.api_hostname] }

}
}
resource "aws_ecr_repository" "app" {
  for_each = toset(["frontend", "backend"])
  name = "${local.name}-${each.key}"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
  scan_on_push = true
}
encryption_configuration {
  encryption_type = "AES256"

}
}
resource "aws_ecr_lifecycle_policy" "app" {
  for_each = aws_ecr_repository.app
  repository = each.value.name
  policy = jsonencode({ rules = [{ rulePriority = 1, description = "Conservar 30 imágenes", selection = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 30 }, action = { type = "expire" } }] })
}

resource "aws_cloudwatch_log_group" "app" {
  for_each = toset(["frontend", "backend"])
  name = "/ecs/${local.name}/${each.key}"
  retention_in_days = var.log_retention_days

}

resource "aws_ecs_cluster" "this" {
  name = local.name
  setting {
  name = "containerInsights"
  value = "enabled"

}
}

resource "aws_secretsmanager_secret" "backend" {
  name = "${local.name}/backend"
  description = "JSON de configuración sensible; la versión se administra fuera de Terraform."
  recovery_window_in_days = 30

}
resource "aws_iam_role" "ecs_execution" {
  name = "${local.name}-ecs-execution"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

}

resource "aws_iam_role_policy" "ecs_secrets" {
  name = "secrets"
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = aws_secretsmanager_secret.backend.arn }] })
}
resource "aws_iam_role" "backend_task" {
  name = "${local.name}-backend-task"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
resource "aws_iam_role" "frontend_task" {
  name = "${local.name}-frontend-task"
  assume_role_policy = aws_iam_role.backend_task.assume_role_policy

}

resource "aws_iam_role_policy" "backend_s3" {
  name = "media"
  role = aws_iam_role.backend_task.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"], Resource = "${aws_s3_bucket.media.arn}/*" }] })
}

resource "aws_ecs_task_definition" "frontend" {
  family = "${local.name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  cpu = var.frontend_cpu
  memory = var.frontend_memory
  execution_role_arn = aws_iam_role.ecs_execution.arn
  task_role_arn = aws_iam_role.frontend_task.arn
  container_definitions = jsonencode([{ name = "frontend", image = var.frontend_image, essential = true, portMappings = [{ containerPort = 3000 }], environment = [{ name = "NODE_ENV", value = "production" }, { name = "PORT", value = "3000" }, { name = "TERALYA_API_URL", value = "https://${var.api_hostname}" }], logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.app["frontend"].name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "app" } } }])

}
resource "aws_ecs_task_definition" "backend" {
  family = "${local.name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  cpu = var.backend_cpu
  memory = var.backend_memory
  execution_role_arn = aws_iam_role.ecs_execution.arn
  task_role_arn = aws_iam_role.backend_task.arn
  container_definitions = jsonencode([{ name = "backend", image = var.backend_image, essential = true, portMappings = [{ containerPort = 3001 }], environment = [{ name = "NODE_ENV", value = "production" }, { name = "PORT", value = "3001" }, { name = "REDIS_URL", value = "rediss://${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379" }, { name = "OBJECT_STORAGE_REGION", value = var.aws_region }, { name = "OBJECT_STORAGE_BUCKET", value = aws_s3_bucket.media.id }, { name = "OBJECT_STORAGE_CDN_BASE_URL", value = "https://${aws_cloudfront_distribution.media.domain_name}" }, { name = "OBJECT_STORAGE_FORCE_PATH_STYLE", value = "false" }], secrets = [for key in local.backend_secret_keys : { name = key, valueFrom = "${aws_secretsmanager_secret.backend.arn}:${key}::" }], logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.app["backend"].name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "app" } } }])

}
resource "aws_ecs_service" "frontend" {
  name = "frontend"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count = var.frontend_desired_count
  launch_type = "FARGATE"
  deployment_maximum_percent = 200
  deployment_minimum_healthy_percent = 100
  enable_execute_command = true
  deployment_circuit_breaker {
  enable = true
  rollback = true
}
network_configuration {
  subnets = values(aws_subnet.private)[*].id
  security_groups = [aws_security_group.frontend.id]
  assign_public_ip = false
}
load_balancer {
  target_group_arn = aws_lb_target_group.frontend.arn
  container_name = "frontend"
  container_port = 3000

}
}

resource "aws_ecs_service" "backend" {
  name = "backend"
  cluster = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count = var.backend_desired_count
  launch_type = "FARGATE"
  deployment_maximum_percent = 200
  deployment_minimum_healthy_percent = 100
  enable_execute_command = true
  deployment_circuit_breaker {
  enable = true
  rollback = true
}
network_configuration {
  subnets = values(aws_subnet.private)[*].id
  security_groups = [aws_security_group.backend.id]
  assign_public_ip = false
}
load_balancer {
  target_group_arn = aws_lb_target_group.backend.arn
  container_name = "backend"
  container_port = 3001

}
}
resource "aws_db_subnet_group" "this" {
  name = local.name
  subnet_ids = values(aws_subnet.private)[*].id

}

resource "aws_db_instance" "postgres" {
  identifier = local.name
  engine = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 5
  storage_type = "gp3"
  storage_encrypted = true
  db_name = "teralya"
  username = "teralya_admin"
  manage_master_user_password = true
  db_subnet_group_name = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.data.id]
  multi_az = var.environment == "production"
  backup_retention_period = var.environment == "production" ? 14 : 7
  deletion_protection = var.deletion_protection
  skip_final_snapshot = false
  final_snapshot_identifier = "${local.name}-final"
  auto_minor_version_upgrade = true
  publicly_accessible = false

}

resource "aws_elasticache_subnet_group" "this" {
  name = local.name
  subnet_ids = values(aws_subnet.private)[*].id

}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = local.name
  description = local.name
  node_type = var.redis_node_type
  port = 6379
  engine = "redis"
  engine_version = "7.1"
  num_cache_clusters = 2
  automatic_failover_enabled = true
  multi_az_enabled = true
  subnet_group_name = aws_elasticache_subnet_group.this.name
  security_group_ids = [aws_security_group.data.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  snapshot_retention_limit = 7

}

resource "aws_s3_bucket" "media" {
  bucket = "${local.name}-media-${data.aws_caller_identity.current.account_id}"
  force_destroy = false

}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true

}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
  status = "Enabled"

}
}

resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
  apply_server_side_encryption_by_default { sse_algorithm = "AES256" }

}
}

resource "aws_cloudfront_origin_access_control" "media" {
  name = local.name
  description = "OAC media"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"

}

resource "aws_cloudfront_distribution" "media" {
  enabled = true
  price_class = "PriceClass_100"
  default_root_object = ""
  origin {
  domain_name = aws_s3_bucket.media.bucket_regional_domain_name
  origin_id = "media"
  origin_access_control_id = aws_cloudfront_origin_access_control.media.id
}
default_cache_behavior {
  target_origin_id = "media"
  viewer_protocol_policy = "redirect-to-https"
  allowed_methods = ["GET", "HEAD", "OPTIONS"]
  cached_methods = ["GET", "HEAD"]
  compress = true
  forwarded_values {
  query_string = false
  cookies {
  forward = "none"
}
}
}
restrictions {
  geo_restriction { restriction_type = "none" }
}
viewer_certificate {
  cloudfront_default_certificate = true
  minimum_protocol_version = "TLSv1.2_2021"

}
}
resource "aws_s3_bucket_policy" "media" {
  bucket = aws_s3_bucket.media.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Sid = "CloudFrontRead", Effect = "Allow", Principal = { Service = "cloudfront.amazonaws.com" }, Action = "s3:GetObject", Resource = "${aws_s3_bucket.media.arn}/*", Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.media.arn } } }] })
}
