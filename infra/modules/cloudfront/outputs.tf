output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_url" {
  description = "CloudFront Distribution URL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 Bucket Name for Frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_bucket_arn" {
  description = "S3 Bucket ARN for Frontend"
  value       = aws_s3_bucket.frontend.arn
}

output "codecommit_repository_name" {
  description = "CodeCommit Repository Name"
  value       = aws_codecommit_repository.frontend.repository_name
}

output "codecommit_clone_url_http" {
  description = "CodeCommit Repository Clone URL (HTTP)"
  value       = aws_codecommit_repository.frontend.clone_url_http
}

output "codecommit_clone_url_ssh" {
  description = "CodeCommit Repository Clone URL (SSH)"
  value       = aws_codecommit_repository.frontend.clone_url_ssh
}

output "codepipeline_name" {
  description = "CodePipeline Name"
  value       = aws_codepipeline.frontend.name
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.frontend.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.frontend.arn
}