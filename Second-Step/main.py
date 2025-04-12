#Step 1: start | use python main.py






# Step 2: import libraries
import boto3
import openai
import os
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from reportlab.pdfgen import canvas






# Step 3: import aws credentials
load_dotenv()
first_aws_access_key_id = os.getenv('FIRST_AWS_ACCESS_KEY_ID')  
first_aws_secret_access_key = os.getenv('FIRST_AWS_SECRET_ACCESS_KEY')
first_aws_region = os.getenv('FIRST_AWS_REGION')  
first_s3_bucket_name = os.getenv('FIRST_S3_BUCKET_NAME')  
second_aws_access_key_id = os.getenv('SECOND_AWS_ACCESS_KEY_ID')
second_aws_secret_access_key = os.getenv('SECOND_AWS_SECRET_ACCESS_KEY')
second_aws_region = os.getenv('SECOND_AWS_REGION')
second_s3_bucket_name = os.getenv('SECOND_S3_BUCKET_NAME')
openai_api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = openai_api_key

# start s3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=first_aws_access_key_id,
    aws_secret_access_key=first_aws_secret_access_key
)










# Step 4: Fetch the file from the S3 bucket
response = s3_client.list_objects_v2(Bucket=first_s3_bucket_name)

if 'Contents' in response:
    # Sort files by LastModified to get the latest file
    sorted_objects = sorted(response['Contents'], key=lambda obj: obj['LastModified'], reverse=True)
    latest_file = sorted_objects[0]  # Get the most recently uploaded file
    object_key = latest_file['Key']  # Get the file name

    print(f"Fetching the latest file: {object_key}")





# Step 5: Download the file
    file_response = s3_client.get_object(Bucket=first_s3_bucket_name, Key=object_key)
    file_content = file_response['Body'].read()

    # Save the file locally with the same name as in the S3 bucket
    with open(object_key, "wb") as file:
        file.write(file_content)

    print(f"File downloaded successfully as '{object_key}'.")
else:
    print("No files found in the S3 bucket.")





# Step 6: Read the PDF file (I THINK WE WANT OPENAI TO READ AS WELL)
def read_pdf(file_path):
    reader = PdfReader(file_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    return text
pdf_text = read_pdf(object_key)

print("PDF file read successfully.")


# Step 7: Send the extracted text to OpenAI API
def process_with_openai(pdf_text, prompt):
    """Process the extracted text with OpenAI GPT-4."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use GPT-4
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt + "\n\n" + pdf_text}
            ],
            max_tokens=1500,  # Adjust max tokens for longer responses
            temperature=0.7  # Adjust for creativity
        )
        return response['choices'][0]['message']['content']
    except openai.error.OpenAIError as e:
        print(f"Error processing with OpenAI: {e}")
        return "Error: Unable to process the request."

# Example: Processing the PDF text with OpenAI
user_prompt = """
Based on the following text, create a practice test with 3 multiple-choice questions. 
Each question should have 4 options (A, B, C, D) and indicate the correct answer at the end.
"""
openai_response = process_with_openai(pdf_text, user_prompt)
print("OpenAI Response:", openai_response)