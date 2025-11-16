variable "agent_arn" {
  description = "Bedrock AgentCore runtime ARN"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "agentcore-lambda"
}