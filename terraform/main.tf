terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.49.0"
    }
  }
}

terraform {
  cloud {
    organization = "Radency"

    workspaces {
      name = "doctoo"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

data "aws_region" "current" {}

module "network" {
  source = "./network"
}

module "ecr" {
  source = "./ecr"
}

output "eip" {
  value = module.network.elastic_ip
}
