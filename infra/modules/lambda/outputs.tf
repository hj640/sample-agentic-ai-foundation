output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.agentcore_lambda.function_name
}

output "lambda_invoke_arn" {
  description = "ARN for invoking the Lambda function"
  value       = aws_lambda_function.agentcore_lambda.invoke_arn
}

