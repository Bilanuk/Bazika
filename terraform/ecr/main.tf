resource "aws_ecr_repository" "bazika-frontend" {
  name                 = "bazika-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

resource "aws_ecr_repository" "bazika-backend" {
  name                 = "bazika-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

resource "aws_ecr_repository" "bazika-ingress" {
  name = "bazika-ingress"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

output "bazika-frontend-repository-url" {
  value = aws_ecr_repository.bazika-frontend.repository_url
}

output "bazika-backend-repository-url" {
  value = aws_ecr_repository.bazika-backend.repository_url
}

output "bazika-ingress-repository-url" {
  value = aws_ecr_repository.bazika-ingress.repository_url
}
