data "aws_iam_policy_document" "ecs_node_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "allocate_eip" {
  statement {
    actions = [
      "ec2:DescribeAddresses", "ec2:AllocateAddress", "ec2:DescribeInstances", "ec2:AssociateAddress"
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

resource "aws_iam_role" "ecs_node_role" {
  name_prefix        = "bazika-ecs-node-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_node_doc.json

  inline_policy {
    name   = "ecs_node_policy"
    policy = data.aws_iam_policy_document.allocate_eip.json
  }
}

resource "aws_iam_role_policy_attachment" "ecs_node_role_policy" {
  role       = aws_iam_role.ecs_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_node" {
  name_prefix = "bazika-ecs-node-profile"
  path        = "/ecs/instance/"
  role        = aws_iam_role.ecs_node_role.name
}

resource "aws_ecs_cluster" "bazika-cluster" {
  name = "bazika-cluster"

  # https://github.com/hashicorp/terraform-provider-aws/issues/11409
  provisioner "local-exec" {
    when = destroy

    command = <<CMD
      # Get the list of capacity providers associated with this cluster
      CAP_PROVS="$(aws ecs describe-clusters --clusters "${self.arn}" \
        --query 'clusters[*].capacityProviders[*]' --output text)"

      # Now get the list of autoscaling groups from those capacity providers
      ASG_ARNS="$(aws ecs describe-capacity-providers \
        --capacity-providers "$CAP_PROVS" \
        --query 'capacityProviders[*].autoScalingGroupProvider.autoScalingGroupArn' \
        --output text)"

      if [ -n "$ASG_ARNS" ] && [ "$ASG_ARNS" != "None" ]
      then
        for ASG_ARN in $ASG_ARNS
        do
          ASG_NAME=$(echo $ASG_ARN | cut -d/ -f2-)

          # Set the autoscaling group size to zero
          aws autoscaling update-auto-scaling-group \
            --auto-scaling-group-name "$ASG_NAME" \
            --min-size 0 --max-size 0 --desired-capacity 0

          # Remove scale-in protection from all instances in the asg
          INSTANCES="$(aws autoscaling describe-auto-scaling-groups \
            --auto-scaling-group-names "$ASG_NAME" \
            --query 'AutoScalingGroups[*].Instances[*].InstanceId' \
            --output text)"
          aws autoscaling set-instance-protection --instance-ids $INSTANCES \
            --auto-scaling-group-name "$ASG_NAME" \
            --no-protected-from-scale-in
        done
      fi
    CMD
  }
}

data "aws_ssm_parameter" "ecs_node_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_launch_template" "ecs_ec2" {
  name_prefix            = "bazika-ecs-ec2-"
  image_id               = data.aws_ssm_parameter.ecs_node_ami.value
  instance_type          = "t2.micro"
  vpc_security_group_ids = [module.network.ecs_node_sg_id]

  iam_instance_profile { arn = aws_iam_instance_profile.ecs_node.arn }
  monitoring { enabled = true }

  user_data = base64encode(<<-EOF
      #!/bin/bash
      echo ECS_CLUSTER=${aws_ecs_cluster.bazika-cluster.name} >> /etc/ecs/ecs.config;

      yum update -y
      yum install -y awscli
      yum install -y jq

      export AWS_DEFAULT_REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region)
      export AWS_DEFAULT_OUTPUT=json

      aws ec2 disassociate-address --public-ip ${module.network.elastic_ip}
      aws ec2 associate-address --instance-id $(curl -s http://169.254.169.254/latest/meta-data/instance-id) --allocation-id ${module.network.elastic_ip_id}

      amazon-linux-extras install epel
      yum -y install certbot

      certbot certonly -d ${var.DOMAIN_NAME} --non-interactive --agree-tos --standalone --email ${var.CERTBOT_EMAIL}
    EOF
  )
}

resource "aws_autoscaling_group" "ecs_nodes" {
  name_prefix               = "bazika-ecs-nodes-"
  vpc_zone_identifier       = [module.network.subnet_id]
  max_size                  = 1
  min_size                  = 1
  health_check_grace_period = 30
  health_check_type         = "EC2"
  protect_from_scale_in     = false
  force_delete              = true

  launch_template {
    id      = aws_launch_template.ecs_ec2.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "bazika-ecs-cluster"
    propagate_at_launch = true
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = ""
    propagate_at_launch = true

  }
}

resource "aws_ecs_capacity_provider" "bazika-capacity-provider" {
  name = "bazika-capacity-provider"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs_nodes.arn
    managed_termination_protection = "DISABLED"

    managed_scaling {
      maximum_scaling_step_size = 1
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "bazika-cluster-capacity-providers" {
  cluster_name       = aws_ecs_cluster.bazika-cluster.name
  capacity_providers = [
    aws_ecs_capacity_provider.bazika-capacity-provider.name,
  ]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.bazika-capacity-provider.name
    base              = 1
    weight            = 100
  }
}

data "aws_iam_policy_document" "ecs_task_execution_doc" {
  statement {
    sid     = "EcsTaskPolicy"
    actions = [
      "ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage"
    ]
    resources = ["*"]
  }
  statement {
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    actions = [
      "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
  statement {
    actions = [
      "secretsmanager:GetSecretValue", "ssm:GetParameters", "kms:Decrypt"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "ecs_task_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name_prefix        = "bazika-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_doc.json

  inline_policy {
    name   = "ecs_task_execution_policy"
    policy = data.aws_iam_policy_document.ecs_task_execution_doc.json
  }
}

resource "aws_iam_role" "ecs_exec_role" {
  name_prefix        = "bazika-ecs-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_exec_role_policy" {
  role       = aws_iam_role.ecs_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "bazika" {
  name              = "/ecs/bazika"
  retention_in_days = 14
}

resource "aws_security_group" "ecs_task" {
  name_prefix = "ecs-task-sg-"
  description = "Allow all traffic within the VPC"
  vpc_id      = module.network.vpc_id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [module.network.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_service" "bazika-backend" {
  name                               = "bazika"
  cluster                            = aws_ecs_cluster.bazika-cluster.id
  task_definition                    = aws_ecs_task_definition.bazika.arn
  deployment_minimum_healthy_percent = 0
  desired_count                      = 1

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.bazika-capacity-provider.name
    base              = 1
    weight            = 100
  }

  ordered_placement_strategy {
    type  = "spread"
    field = "attribute:ecs.availability-zone"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}
