variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "branch_name" {
  description = "Git branch name for CI/CD"
  type        = string
  default     = "main"
}

variable "build_environment_variables" {
  description = "Environment variables for CodeBuild"
  type        = map(string)
  default     = {}
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

variable "api_gateway_url" {
  description = "API Gateway URL"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}