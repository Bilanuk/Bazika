variable "domain" {
  type        = string
  description = "The domain name for the website"
}

variable "certbot_email" {
  type        = string
  description = "The email address to use for certbot"
}

variable "db_host" {
  type    = string
  default = "localhost"
}

variable "db_port" {
  type    = string
  default = "5432"
}

variable "db_username" {
  type    = string
  default = "postgres"
}

variable "db_password" {
  type    = string
  default = "postgres"
}

variable "db_name" {
  type    = string
  default = "bazika-database"
}

variable "token_salt" {
  type    = string
  default = "some-salt"
}

variable "api_url" {
  type    = string
  default = "http://localhost:3000/"
}

variable "domain_url" {
  type    = string
  default = "https://enter.radency.com"
}

variable "test_runner_url" {
  type    = string
  default = "http://bazika.bazika.local:3001"
}

variable "auth_token" {
  type    = string
  default = "very-secret-token"
}

variable "sentry_dns" {
  type        = string
  description = "Sentry DSN for logging"
}

variable "mail_host" {
  type = string
}

variable "mail_port" {
  type = string
}

variable "mail_user" {
  type = string
}

variable "mail_password" {
  type = string
}

variable "mail_from" {
  default = "hello@radency.tech"
}

variable "aws_access_key_id" {
  type = string
}

variable "aws_secret_access_key" {
  type = string
}
