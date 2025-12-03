# Terraform configuration pour Jour de Marché API
# À compléter avec les ressources AWS/GCP

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "eu-west-1"
}

variable "environment" {
  default = "production"
}

# À compléter avec:
# - ECR (Docker registry)
# - ECS (Container orchestration)
# - RDS (Managed MongoDB)
# - ElastiCache (Managed Redis)
# - ALB (Load balancer)
# - VPC, Security groups, etc.
