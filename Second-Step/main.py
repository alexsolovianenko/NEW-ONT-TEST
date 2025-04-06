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

# start s3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=first_aws_access_key_id,
    aws_secret_access_key=first_aws_secret_access_key
)


# Step 5: Fetch the latest file from the S3 bucket
response = s3_client.list_objects_v2(Bucket=first_s3_bucket_name)

if 'Contents' in response:
    # Sort files by LastModified to get the latest file
    sorted_objects = sorted(response['Contents'], key=lambda obj: obj['LastModified'], reverse=True)
    latest_file = sorted_objects[0]  # Get the most recently uploaded file
    object_key = latest_file['Key']  # Get the file name

    print(f"Fetching the latest file: {object_key}")

    # Step 6: Download the file locally
    file_response = s3_client.get_object(Bucket=first_s3_bucket_name, Key=object_key)
    file_content = file_response['Body'].read()

    # Save the file locally
    with open("downloaded_file.pdf", "wb") as file:
        file.write(file_content)

    print("File downloaded successfully as 'downloaded_file.pdf'.")
else:
    print("No files found in the S3 bucket.")