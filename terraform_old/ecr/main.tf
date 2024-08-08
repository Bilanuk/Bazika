resource "aws_ecr_repository" "bazika-client" {
  name                 = "bazika-client"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

resource "aws_ecr_repository" "bazika-backend" {
  name                 = "bazika-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

output "bazika-client-repository-url" {
  value = aws_ecr_repository.bazika-client.repository_url
}

output "bazika-backend-repository-url" {
  value = aws_ecr_repository.bazika-backend.repository_url
}
