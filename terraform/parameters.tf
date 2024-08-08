resource "aws_ssm_parameter" "NEXT_PUBLIC_SUPABASE_URL" {
  name  = "NEXT_PUBLIC_SUPABASE_URL"
  type  = "String"
  value = var.NEXT_PUBLIC_SUPABASE_URL
}

resource "aws_ssm_parameter" "SUPABASE_SERVICE_ROLE_KEY" {
  name  = "SUPABASE_SERVICE_ROLE_KEY"
  type  = "String"
  value = var.SUPABASE_SERVICE_ROLE_KEY
}

resource "aws_ssm_parameter" "GOOGLE_CLIENT_ID" {
  name  = "GOOGLE_CLIENT_ID"
  type  = "String"
  value = var.GOOGLE_CLIENT_ID
}

resource "aws_ssm_parameter" "NEXT_PUBLIC_GOOGLE_CLIENT_ID" {
  name  = "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
  type  = "String"
  value = var.NEXT_PUBLIC_GOOGLE_CLIENT_ID
}

resource "aws_ssm_parameter" "GOOGLE_CLIENT_SECRET" {
  name  = "GOOGLE_CLIENT_SECRET"
  type  = "String"
  value = var.GOOGLE_CLIENT_SECRET
}

resource "aws_ssm_parameter" "APP_JWT_SECRET" {
  name  = "APP_JWT_SECRET"
  type  = "String"
  value = var.APP_JWT_SECRET
}

resource "aws_ssm_parameter" "NEXTAUTH_SECRET" {
  name  = "NEXTAUTH_SECRET"
  type  = "String"
  value = var.NEXTAUTH_SECRET
}

resource "aws_ssm_parameter" "NEXTAUTH_URL" {
  name  = "NEXTAUTH_URL"
  type  = "String"
  value = var.NEXTAUTH_URL
}

resource "aws_ssm_parameter" "NEXT_PUBLIC_API_URL" {
  name  = "NEXT_PUBLIC_API_URL"
  type  = "String"
  value = var.NEXT_PUBLIC_API_URL
}

resource "aws_ssm_parameter" "DATABASE_URL" {
  name  = "DATABASE_URL"
  type  = "String"
  value = var.DATABASE_URL
}

resource "aws_ssm_parameter" "DIRECT_URL" {
  name  = "DIRECT_URL"
  type  = "String"
  value = var.DIRECT_URL
}

resource "aws_ssm_parameter" "GOOGLE_CALLBACK_URL" {
  name  = "GOOGLE_CALLBACK_URL"
  type  = "String"
  value = var.GOOGLE_CALLBACK_URL
}
