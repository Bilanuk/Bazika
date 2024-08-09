variable "NEXT_PUBLIC_SUPABASE_URL" {
  type        = string
  description = "Supabase URL for the public API"
}

variable "SUPABASE_SERVICE_ROLE_KEY" {
  type        = string
  description = "Supabase service role key"
}

variable "DOMAIN_NAME" {
  type        = string
  description = "Domain name"
}

variable "API_URL" {
  type        = string
  description = "API URL"
}

variable "APP_URL" {
  type        = string
  description = "Application URL"
}

variable "GOOGLE_CLIENT_ID" {
  type        = string
  description = "Google client ID"
}

variable "NEXT_PUBLIC_GOOGLE_CLIENT_ID" {
  type        = string
  description = "Google client ID for public use"
}

variable "GOOGLE_CLIENT_SECRET" {
  type        = string
  description = "Google client secret"
}

variable "APP_JWT_SECRET" {
  type        = string
  description = "JWT secret for the application"
}

variable "NEXTAUTH_SECRET" {
  type        = string
  description = "NextAuth secret"
}

variable "NEXTAUTH_URL" {
  type        = string
  description = "URL for NextAuth"
}

variable "NEXT_PUBLIC_API_URL" {
  type        = string
  description = "Public API URL"
}

variable "DATABASE_URL" {
  type        = string
  description = "Database connection URL"
}

variable "DIRECT_URL" {
  type        = string
  description = "Direct database connection URL"
}

variable "GOOGLE_CALLBACK_URL" {
  type        = string
  description = "Google OAuth callback URL"
}
