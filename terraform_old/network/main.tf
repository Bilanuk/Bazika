locals {
  azs_names = ["eu-central-1a", "eu-central-1b", "eu-central-1c"]
}

resource "aws_vpc" "bazika-vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = {
    Name = "bazika-vpc"
  }
}

resource "aws_subnet" "bazika-public-subnet" {
  count                   = 1
  vpc_id                  = aws_vpc.bazika-vpc.id
  cidr_block              = cidrsubnet(aws_vpc.bazika-vpc.cidr_block, 1, 0)
  availability_zone       = local.azs_names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "bazika-public-subnet-${local.azs_names[count.index]}"
  }
}

resource "aws_internet_gateway" "bazika-igw" {
  vpc_id = aws_vpc.bazika-vpc.id
  tags   = {
    Name = "bazika-igw"
  }
}

resource "aws_eip" "bazika-eip" {
  depends_on = [aws_internet_gateway.bazika-igw]
  tags       = {
    Name = "bazika-eip"
  }
}

resource "aws_network_interface" "bazika-nic" {
  subnet_id       = aws_subnet.bazika-public-subnet[0].id
  security_groups = [aws_security_group.ecs_node_sg.id]
  tags            = {
    Name = "bazika-nic"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.bazika-vpc.id
  tags   = {
    Name = "bazika-public-route-table"
  }

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.bazika-igw.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.bazika-public-subnet[0].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "ecs_node_sg" {
  name_prefix = "bazika-ecs-node-sg"
  vpc_id      = aws_vpc.bazika-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # retool whitelist
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["35.90.103.132/30", "44.208.168.68/30"]
  }

  dynamic "ingress" {
    for_each = [80, 443]
    content {
      protocol    = "tcp"
      from_port   = ingress.value
      to_port     = ingress.value
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "ecs_node_sg_id" {
  value = aws_security_group.ecs_node_sg.id
}

output "subnet_id" {
  value = aws_subnet.bazika-public-subnet[0].id
}

output "vpc_id" {
  value = aws_vpc.bazika-vpc.id
}

output "vpc_cidr_block" {
  value = aws_vpc.bazika-vpc.cidr_block
}

output "elastic_ip" {
  value = aws_eip.bazika-eip.public_ip
}

output "elastic_ip_id" {
  value = aws_eip.bazika-eip.id
}
