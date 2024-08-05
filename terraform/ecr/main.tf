resource "aws_ecr_repository" "doctoo-client" {
  name                 = "doctoo-client"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

resource "aws_ecr_repository" "doctoo-core" {
  name                 = "doctoo-core"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

resource "aws_ecr_repository" "doctoo-test-runner" {
  name                 = "doctoo-test-runner"
  image_tag_mutability = "MUTABLE"
  force_delete         = false
}

output "doctoo-client-repository-url" {
  value = aws_ecr_repository.doctoo-client.repository_url
}

output "doctoo-core-repository-url" {
  value = aws_ecr_repository.doctoo-core.repository_url
}

output "doctoo-test-runner-repository-url" {
  value = aws_ecr_repository.doctoo-test-runner.repository_url
}
