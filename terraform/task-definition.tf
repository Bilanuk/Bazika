resource "aws_ecs_task_definition" "bazika-backend" {
  family             = "bazika-backend"
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_task_role.arn
  network_mode       = "host"
  cpu                = 900
  memory             = 700

  volume {
    name      = "letsencrypt"
    host_path = "/etc/letsencrypt"
  }

  container_definitions = jsonencode([
    {
      name      = "client"
      image     = "${module.ecr.bazika-frontend-repository-url}:latest"
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
          "awslogs-group"         = aws_cloudwatch_log_group.bazika.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "bazika-client"
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
          containerPort = 3000
          hostPort      = 3000
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
          "awslogs-group"         = aws_cloudwatch_log_group.bazika.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "bazika-backend"
        }
      }
    }
  ])
}
