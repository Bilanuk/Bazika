resource "aws_s3_bucket" "doctoo_bucket" {
  bucket = "doctoo-bucket-aws"

  force_destroy = true
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.doctoo_bucket.id
  acl    = "public-read"

  depends_on = [aws_s3_bucket_ownership_controls.s3_bucket_acl_ownership, aws_s3_bucket_public_access_block.bucket_acl_public_access_block]
}

resource "aws_s3_bucket_ownership_controls" "s3_bucket_acl_ownership" {
  bucket = aws_s3_bucket.doctoo_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  depends_on = [aws_s3_bucket_public_access_block.bucket_acl_public_access_block]
}

resource "aws_iam_user" "doctoo_bucket_bucket" {
  name = "doctoo-bucket"
}

resource "aws_s3_bucket_public_access_block" "bucket_acl_public_access_block" {
  bucket = aws_s3_bucket.doctoo_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "doctoo_bucket_bucket" {
  bucket = aws_s3_bucket.doctoo_bucket.id
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Principal = "*"
        Action    = [
          "s3:*",
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.doctoo_bucket.id}", "arn:aws:s3:::${aws_s3_bucket.doctoo_bucket.id}/*"
        ]
      }, {
        Sid       = "PublicReadGetObject"
        Principal = "*"
        Action    = [
          "s3:GetObject",
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.doctoo_bucket.id}", "arn:aws:s3:::${aws_s3_bucket.doctoo_bucket.id}/*"
        ]
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.bucket_acl_public_access_block]
}
