terraform {
  backend "s3" {
    encrypt = true
    key     = "sample-agentic-ai-foundation.tfstate"
    region  = "us-east-1"
    # TODO: Can we enable use_lockfile = true ?
  }

  required_providers {
    aws = {
      source = "hashicorp/aws"
      # v6.18 added support for Bedrock AgentCore Memory
      version = ">= 6.18"
    }
  }
}
