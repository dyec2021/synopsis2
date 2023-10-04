import json
import boto3
import html
import re

endpoint_name = "jumpstart-dft-meta-textgeneration-llama-2-7b-f"


def handler(event, context):

    print('received event:')
    print(event)
    print(event["queryStringParameters"]['prompt'])
    print('\nEnd debug\n')

    print('received event:')
    print(event)

    if not validate_input(event["queryStringParameters"]['prompt']):
        return return_error("Invalid input")
    if not validate_input(event["queryStringParameters"]['system_prompt']):
        return return_error("Invalid input")

    user_dialog = {"role": "user", "content": sanitize_input(event['queryStringParameters']["prompt"])}
    system_dialog = {"role": "system", "content": sanitize_input(event['queryStringParameters']["system_prompt"])}
    return_string = ""

    payload = {
        "inputs": [[system_dialog,user_dialog]], 
        "parameters": {"max_new_tokens": 256, "top_p": 0.9, "temperature": 0.6}
    }
    result = query_endpoint(payload)[0]

    print(f"> {result['generation']['role'].capitalize()}: {result['generation']['content']}")
    return_string += f"{result['generation']['content']}\n"

    return {
        'statusCode': 200,
        'headers': {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(return_string)
    }


def query_endpoint(payload):
    client = boto3.client("sagemaker-runtime")
    response = client.invoke_endpoint(
        EndpointName=endpoint_name,
        ContentType="application/json",
        Body=json.dumps(payload),
        CustomAttributes="accept_eula=true",
    )
    response = response["Body"].read().decode("utf8")
    response = json.loads(response)
    return response

def validate_input(input):
    if(re.match(r"^[a-zA-Z0-9\. \-\_\'\:\(\)\,\{\}\"\[\]\n]+$", input) == None):
        return False
    return True

def sanitize_input(input):
    return html.escape(input)

def return_error(message):
    return {
        'statusCode': 200,
        'headers': {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(message)
    }