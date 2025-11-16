output "api_gateway_url" {
  description = "API Gateway URL for frontend integration"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

# Amplify SDK Configuration
output "amplify_user_pool_id" {
  description = "Cognito User Pool ID for Amplify SDK"
  value       = var.cognito_user_pool_id
}

output "amplify_client_id" {
  description = "Cognito Client ID for Amplify SDK"
  value       = var.cognito_client_id
}

output "amplify_api_endpoint" {
  description = "API Gateway endpoint for Amplify SDK"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

