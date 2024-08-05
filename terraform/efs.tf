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

resource "aws_efs_file_system" "doctoo" {
  tags = {
    Name = "doctoo-ecs-efs"
  }
}

resource "aws_efs_mount_target" "doctoo" {
  file_system_id  = aws_efs_file_system.doctoo.id
  subnet_id       = module.network.subnet_id
  security_groups = [aws_security_group.allow_nfs_inbound.id]
}

resource "aws_efs_access_point" "doctoo-postgres" {
  file_system_id = aws_efs_file_system.doctoo.id
  root_directory {
    path = "/postgres"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}

resource "aws_efs_access_point" "doctoo-test-runner-tasks" {
  file_system_id = aws_efs_file_system.doctoo.id
  root_directory {
    path = "/test-runner-tasks"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}

resource "aws_efs_access_point" "doctoo-test-runner-sandbox" {
  file_system_id = aws_efs_file_system.doctoo.id
  root_directory {
    path = "/test-runner-sandbox"
    creation_info {
      owner_gid   = 0
      owner_uid   = 0
      permissions = "777"
    }
  }
}
