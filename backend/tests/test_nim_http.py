import urllib.request
import json
import sys

api_key = "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"

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "meta/llama-3.3-70b-instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
}

req = urllib.request.Request(
    url, 
    data=json.dumps(data).encode('utf-8'), 
    headers=headers,
    method="POST"
)

try:
    print("Sending POST request to NVIDIA NIM...")
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = response.read().decode('utf-8')
        print("Success! Response status code:", response.status)
        print("Response body:")
        print(res_data)
except urllib.error.HTTPError as e:
    print(f"HTTP Error occurred: {e.code} - {e.reason}", file=sys.stderr)
    try:
        body = e.read().decode('utf-8')
        print("Error response body:", body, file=sys.stderr)
    except Exception:
        pass
except Exception as e:
    print(f"General Error: {e}", file=sys.stderr)
