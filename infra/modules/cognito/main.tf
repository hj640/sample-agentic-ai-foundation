data "aws_region" "current" {}

resource "aws_cognito_user_pool" "user_pool" {
  name = var.user_pool_name

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]

  username_attributes = ["email"]

  schema {
    attribute_data_type = "String"
    name               = "email"
    required           = true
    mutable            = true
  }
}

# Need to set generate_secret = false for AWS Amplify SDK 
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "${var.user_pool_name}-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false 
  
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}