import sys
from openai import OpenAI

api_key = "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"

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=api_key
)

try:
    print("Testing connection to NVIDIA NIM...")
    models = client.models.list()
    model_ids = [m.id for m in models.data]
    
    target_model = "meta/llama-3.3-70b-instruct"
    print(f"Checking if {target_model} is available...")
    if target_model in model_ids:
        print(f"Model {target_model} is available!")
    else:
        print(f"Model {target_model} is NOT available in the retrieved list!")
        # Let's print all meta/ models
        meta_models = [mid for mid in model_ids if "meta" in mid]
        print("Available meta models:")
        for mm in meta_models:
            print(f"- {mm}")
            
    print("Sending a test completion request...")
    response = client.chat.completions.create(
        model=target_model,
        messages=[{"role": "user", "content": "Hello! Reply with exactly 'Ready'."}],
        max_tokens=10
    )
    print("Response received successfully:")
    # Replace non-ascii characters in output just in case
    content = response.choices[0].message.content or ""
    print(content.encode('ascii', errors='replace').decode('ascii'))
except Exception as e:
    print(f"Error occurred: {e}", file=sys.stderr)
