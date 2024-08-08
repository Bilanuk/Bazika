resource "aws_security_group" "allow_nfs_inbound" {
  name   = "allow-nfs-inbound"
  vpc_id = module.network.vpc_id

  ingress {
    from_port        = 2049
    to_port          = 2049
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "all"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_efs_file_system" "bazika" {
  tags = {
    Name = "bazika-ecs-efs"
  }
}

resource "aws_efs_mount_target" "bazika" {
  file_system_id  = aws_efs_file_system.bazika.id
  subnet_id       = module.network.subnet_id
  security_groups = [aws_security_group.allow_nfs_inbound.id]
}

resource "aws_efs_access_point" "bazika-postgres" {
  file_system_id = aws_efs_file_system.bazika.id
  root_directory {
    path = "/postgres"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}

resource "aws_efs_access_point" "bazika-test-runner-tasks" {
  file_system_id = aws_efs_file_system.bazika.id
  root_directory {
    path = "/test-runner-tasks"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}

resource "aws_efs_access_point" "bazika-test-runner-sandbox" {
  file_system_id = aws_efs_file_system.bazika.id
  root_directory {
    path = "/test-runner-sandbox"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}
