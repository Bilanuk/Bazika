resource "aws_ecs_task_definition" "doctoo-core" {
  family             = "doctoo-core"
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_role.arn
  network_mode       = "host"
  cpu                = 900
  memory             = 700

  volume {
    name = "postgres-data"
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.doctoo.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.doctoo-postgres.id
        iam             = "ENABLED"
      }
    }
  }

  volume {
    name      = "letsencrypt"
    host_path = "/etc/letsencrypt"
  }

  container_definitions = jsonencode([
    {
      name      = "client"
      image     = "${module.ecr.doctoo-client-repository-url}:latest"
      essential = true
      memory    = 100
      cpu       = 20

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          name          = "client"
        }, {
          containerPort = 443
          hostPort      = 443
          name          = "client-ssl"
        }
      ]

      environment = [
        {
          name  = "DOMAIN_NAME"
          value = var.domain
        }, {
          name  = "API_URL"
          value = var.api_url
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "letsencrypt"
          containerPath = "/etc/letsencrypt"
          readOnly      = true
        }
      ]

      dependsOn = [
        {
          containerName = "core"
          condition     = "START"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.doctoo.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "doctoo-client"
        }
      }
    }, {
      name         = "core"
      image        = "${module.ecr.doctoo-core-repository-url}:latest"
      essential    = true
      memory       = 256
      cpu          = 256
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]

      secrets = [
        {
          name      = "DB_HOST"
          valueFrom = aws_ssm_parameter.db_host.arn
        }, {
          name      = "DB_PORT"
          valueFrom = aws_ssm_parameter.db_port.arn
        }, {
          name      = "DB_USERNAME"
          valueFrom = aws_ssm_parameter.db_username.arn
        }, {
          name      = "DB_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        }, {
          name      = "DB_NAME"
          valueFrom = aws_ssm_parameter.db_name.arn
        }, {
          name      = "TOKEN_SALT"
          valueFrom = aws_ssm_parameter.token_salt.arn
        }, {
          name      = "DOMAIN_URL"
          valueFrom = aws_ssm_parameter.domain_url.arn
        }, {
          name      = "TEST_RUNNER_URL"
          valueFrom = aws_ssm_parameter.test_runner_url.arn
        }, {
          name      = "AUTH_TOKEN"
          valueFrom = aws_ssm_parameter.auth_token.arn
        }, {
          name      = "SENTRY_DNS"
          valueFrom = aws_ssm_parameter.sentry_dns.arn
        }, {
          name      = "MAIL_HOST"
          valueFrom = aws_ssm_parameter.mail_host.arn
        }, {
          name      = "MAIL_PORT"
          valueFrom = aws_ssm_parameter.mail_port.arn
        }, {
          name      = "MAIL_USER"
          valueFrom = aws_ssm_parameter.mail_user.arn
        }, {
          name      = "MAIL_PASSWORD"
          valueFrom = aws_ssm_parameter.mail_password.arn
        }, {
          name      = "MAIL_FROM"
          valueFrom = aws_ssm_parameter.mail_from.arn
        }, {
          name      = "AWS_ACCESS_KEY_ID"
          valueFrom = aws_ssm_parameter.aws_access_key_id.arn
        }, {
          name      = "AWS_SECRET_ACCESS_KEY"
          valueFrom = aws_ssm_parameter.aws_secret_access_key.arn
        }, {
          name      = "AWS_BUCKET_NAME"
          valueFrom = aws_ssm_parameter.aws_bucket_name.arn
        }
      ]

      dependsOn = [
        {
          containerName = "postgres"
          condition     = "START"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.doctoo.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "doctoo-core"
        }
      }
    }, {
      name         = "postgres"
      image        = "postgres:latest"
      essential    = true
      memory       = 100
      cpu          = 100
      portMappings = [
        {
          containerPort = 5432
          hostPort      = 5432
        }
      ]

      secrets = [
        {
          name      = "POSTGRES_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        }, {
          name      = "POSTGRES_USER"
          valueFrom = aws_ssm_parameter.db_username.arn
        }, {
          name      = "POSTGRES_DB"
          valueFrom = aws_ssm_parameter.db_name.arn
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "postgres-data"
          containerPath = "/var/lib/postgresql/data"
          readOnly      = false
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "pg_isready -U postgres"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.doctoo.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "doctoo-database"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "doctoo-test-runner" {
  family             = "doctoo-test-runner"
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_role.arn
  network_mode       = "awsvpc"
  cpu                = 256
  memory             = 256

  volume {
    name = "tasks"
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.doctoo.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.doctoo-test-runner-tasks.id
        iam             = "ENABLED"
      }
    }
  }

  volume {
    name = "sandbox"
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.doctoo.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.doctoo-test-runner-sandbox.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "test-runner"
      image     = "${module.ecr.doctoo-test-runner-repository-url}:latest"
      essential = true
      memory    = 256
      cpu       = 256

      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "tasks"
          containerPath = "/test-runner/tasks"
          readOnly      = false
        }, {
          sourceVolume  = "sandbox"
          containerPath = "/test-runner/sandbox"
          readOnly      = false
        }
      ]

      environment = [
        {
          name  = "SANDBOX_PATH"
          value = "./sandbox"
        }, {
          name  = "JS_SCRIPT_PATH"
          value = "./sandbox/js/js.sh"
        }, {
          name  = "TASKS_PATH"
          value = "./tasks"
        }, {
          name  = "JS_TASK_NAME"
          value = "task.js"
        }, {
          name  = "JS_TEST_NAME"
          value = "test.spec.js"
        }, {
          name  = "DOTNET_TASK_NAME"
          value = "Task.cs"
        }, {
          name  = "DOTNET_TEST_NAME"
          value = "Test.cs"
        }, {
          name  = "DOTNET_SCRIPT_PATH"
          value = "./sandbox/dotnet/dotnet.sh"
        }, {
          name  = "PORT"
          value = "3001"
        }, {
          name  = "THRESHOLD"
          value = "24000"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.doctoo.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "doctoo-test-runner"
        }
      }
    }
  ])
}
