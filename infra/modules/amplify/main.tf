# API Gateway Setup
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  
  # CORS Configuration
  cors_configuration {
    allow_credentials = false  # Cannot be true when allow_origins is *
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent", "x-access-token"]
    allow_methods     = ["*"]
    allow_origins     = var.allowed_origins
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }

  tags = var.tags
}

resource "aws_apigatewayv2_stage" "main" {
  api_id = aws_apigatewayv2_api.main.id
  name   = "$default"
  auto_deploy = true

  tags = var.tags
}

data "aws_region" "current" {}

# JWT Authentication from Cognito
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-cognito-authorizer"

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

# Lambda Integration
resource "aws_apigatewayv2_integration" "lambda" {
  api_id = aws_apigatewayv2_api.main.id

  integration_uri    = var.lambda_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# Main API Routes with JWT Authorization
resource "aws_apigatewayv2_route" "invocations" {
  api_id = aws_apigatewayv2_api.main.id

  route_key = "POST /invocations"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "conversations" {
  api_id = aws_apigatewayv2_api.main.id

  route_key = "GET /api/v1/{conversation_id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "feedback" {
  api_id = aws_apigatewayv2_api.main.id

  route_key = "POST /api/v1/invocations"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
