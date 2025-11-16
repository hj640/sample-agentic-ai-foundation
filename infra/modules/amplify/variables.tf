variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for JWT authentication"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito User Pool Client ID for JWT authentication"
  type        = string
}

variable "discovery_url" {
  description = "Cognito User Pool Discovery URL for JWT authentication"
  type        = string
}

variable "lambda_function_name" {
  description = "Lambda function name for API integration"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Lambda function invoke ARN for API integration"
  type        = string
}

variable "allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}