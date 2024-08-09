resource "aws_ecs_task_definition" "bazika" {
  family             = "bazika"
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_role.arn
  network_mode       = "bridge"
  cpu                = 900
  memory             = 700

  volume {
    name      = "letsencrypt"
    host_path = "/etc/letsencrypt"
  }

  container_definitions = jsonencode([
    {
      name      = "ingress"
      image     = "${module.ecr.bazika-ingress-repository-url}:latest"
      essential = true
      memory    = 100
      cpu       = 20

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          name          = "ingress"
        }, {
          containerPort = 443
          hostPort      = 443
          name          = "ingress-ssl"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "letsencrypt"
          containerPath = "/etc/letsencrypt"
        }
      ]

      environment = [
        {
          name  = "DOMAIN_NAME"
          value = var.DOMAIN_NAME
        }, {
          name  = "API_URL"
          value = var.API_URL
        }, {
          name  = "APP_URL"
          value = var.APP_URL
        }
      ]

      dependsOn = [
        {
          containerName = "backend"
          condition     = "START"
        },
        {
          containerName = "frontend"
          condition     = "START"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.bazika.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "bazika-ingress"
        }
      }
    },
    {
      name      = "frontend"
      image     = "${module.ecr.bazika-frontend-repository-url}:latest"
      essential = true
      memory    = 100
      cpu       = 20

      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
          name          = "nextjs"
        }
      ]

      dependsOn = [
        {
          containerName = "backend"
          condition     = "START"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.bazika.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "bazika-frontend"
        }
      }
    }, {
      name         = "backend"
      image        = "${module.ecr.bazika-backend-repository-url}:latest"
      essential    = true
      memory       = 256
      cpu          = 256

      portMappings = [
        {
          containerPort = 4001
          hostPort      = 4001
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          "awslogs-group"         = aws_cloudwatch_log_group.bazika.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "bazika-backend"
        }
      }
    }
  ])
}
