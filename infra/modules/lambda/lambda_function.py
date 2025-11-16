import json
import urllib3
import urllib.parse
import uuid
import os

def lambda_handler(event, context):
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        message = body.get('input', {}).get('prompt', '')
        conversation_id = body.get('input', {}).get('conversation_id', str(uuid.uuid4()))
        
        if len(conversation_id) < 33:
            conversation_id = str(uuid.uuid4())
        
        # Get access token from custom header for AgentCore
        access_token = event.get('headers', {}).get('x-access-token', '')
        if not access_token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing X-Access-Token header'})
            }
        
        # Invoke agent
        result = invoke_agent(message, access_token, conversation_id)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def invoke_agent(message, auth_token, session_id):
    agent_arn = os.environ['AGENT_ARN']
    region = 'us-east-1'
    
    escaped_agent_arn = urllib.parse.quote(agent_arn, safe='')
    url = f"https://bedrock-agentcore.{region}.amazonaws.com/runtimes/{escaped_agent_arn}/invocations?qualifier=DEFAULT"
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
        "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": session_id
    }
    
    payload = {"input": {"prompt": message, "conversation_id": session_id}}
    
    http = urllib3.PoolManager()
    response = http.request(
        'POST',
        url,
        body=json.dumps(payload),
        headers=headers,
        timeout=61
    )
    
    if response.status == 200:
        return json.loads(response.data.decode('utf-8'))
    else:
        return {'error': f'AgentCore returned {response.status}: {response.data.decode("utf-8")}'}