resource "aws_ssm_parameter" "db_host" {
  name  = "DB_HOST"
  type  = "String"
  value = var.db_host
}

resource "aws_ssm_parameter" "db_port" {
  name  = "DB_PORT"
  type  = "String"
  value = var.db_port
}

resource "aws_ssm_parameter" "db_username" {
  name  = "DB_USERNAME"
  type  = "String"
  value = var.db_username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "DB_PASSWORD"
  type  = "String"
  value = var.db_password
}

resource "aws_ssm_parameter" "db_name" {
  name  = "DB_NAME"
  type  = "String"
  value = var.db_name
}

resource "aws_ssm_parameter" "token_salt" {
  name  = "TOKEN_SALT"
  type  = "String"
  value = var.token_salt
}

resource "aws_ssm_parameter" "domain_url" {
  name  = "DOMAIN_URL"
  type  = "String"
  value = var.domain_url
}

resource "aws_ssm_parameter" "test_runner_url" {
  name  = "TEST_RUNNER_URL"
  type  = "String"
  value = var.test_runner_url
}

resource "aws_ssm_parameter" "auth_token" {
  name  = "AUTH_TOKEN"
  type  = "String"
  value = var.auth_token
}

resource "aws_ssm_parameter" "sentry_dns" {
  name  = "SENTRY_DNS"
  type  = "String"
  value = var.sentry_dns
}

resource "aws_ssm_parameter" "mail_host" {
  name  = "MAIL_HOST"
  type  = "String"
  value = var.mail_host
}

resource "aws_ssm_parameter" "mail_port" {
  name  = "MAIL_PORT"
  type  = "String"
  value = var.mail_port
}

resource "aws_ssm_parameter" "mail_user" {
  name  = "MAIL_USER"
  type  = "String"
  value = var.mail_user
}

resource "aws_ssm_parameter" "mail_password" {
  name  = "MAIL_PASSWORD"
  type  = "String"
  value = var.mail_password
}

resource "aws_ssm_parameter" "mail_from" {
  name  = "MAIL_FROM"
  type  = "String"
  value = var.mail_from
}

resource "aws_ssm_parameter" "aws_access_key_id" {
  name  = "ACCESS_KEY_ID_AWS"
  type  = "String"
  value = var.aws_access_key_id
}

resource "aws_ssm_parameter" "aws_secret_access_key" {
  name  = "SECRET_ACCESS_KEY_AWS"
  type  = "String"
  value = var.aws_secret_access_key
}

resource "aws_ssm_parameter" "aws_bucket_name" {
  name  = "BUCKET_NAME_AWS"
  type  = "String"
  value = aws_s3_bucket.bazika_bucket.bucket

  depends_on = [aws_s3_bucket.bazika_bucket]
}
