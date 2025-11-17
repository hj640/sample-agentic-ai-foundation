output "agent_runtime_arn" {
  description = "ARN of deployed AgentCore Runtime"
  value       = aws_bedrockagentcore_agent_runtime.agent_runtime.agent_runtime_arn
}

output "bedrock_role_arn" {
  description = "ARN of the Bedrock agent role"
  value       = module.bedrock_role.role_arn
}

output "knowledge_base_id" {
  description = "ID of the knowledge base"
  value       = module.kb_stack.knowledge_base_id
}

output "guardrail_id" {
  description = "ID of the guardrail"
  value       = module.guardrail.guardrail_id
}

output "user_pool_id" {
  description = "ID of the Cognito user pool"
  value       = module.cognito.user_pool_id
}

output "client_id" {
  description = "ID of the Cognito client"
  value       = module.cognito.user_pool_client_id
}

output "data_source_id" {
  description = "ID of the knowledge base data source"
  value       = module.kb_stack.data_source_id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for knowledge base"
  value       = module.kb_stack.s3_bucket_name
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_gateway_url
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.agentcore_lambda.lambda_function_name
}

output "cloudfront_url" {
  description = "CloudFront Distribution URL"
  value       = module.cloudfront.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = module.cloudfront.cloudfront_distribution_id
}

output "codecommit_repository_name" {
  description = "CodeCommit Repository Name"
  value       = module.cloudfront.codecommit_repository_name
}
