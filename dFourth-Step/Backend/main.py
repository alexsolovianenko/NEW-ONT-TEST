# Import statements
import boto3
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables
load_dotenv()
second_aws_access_key_id = os.getenv('SECOND_AWS_ACCESS_KEY_ID')
second_aws_secret_access_key = os.getenv('SECOND_AWS_SECRET_ACCESS_KEY')
second_aws_region = os.getenv('SECOND_AWS_REGION')
second_s3_bucket_name = os.getenv('SECOND_S3_BUCKET_NAME')

# S3 client setup and file fetching
s3_client = boto3.client(
    's3',
    aws_access_key_id=second_aws_access_key_id,
    aws_secret_access_key=second_aws_secret_access_key,
)
response = s3_client.list_objects_v2(Bucket=second_s3_bucket_name)

# Fetch all PDF files from the S3 bucket
if 'Contents' in response:
    pdf_files = [obj for obj in response['Contents'] if obj['Key'].lower().endswith('.pdf')]

    if pdf_files:
        for pdf_file in pdf_files:
            object_key = pdf_file['Key']
            print(f"Fetching file: {object_key}")

            file_response = s3_client.get_object(Bucket=second_s3_bucket_name, Key=object_key)
            file_content = file_response['Body'].read()

            # Save the file locally
            with open(object_key, "wb") as file:
                file.write(file_content)

            print(f"File downloaded successfully as '{object_key}'.")

            # Determine the appropriate HTML file based on the file name
            if any(keyword in object_key.lower() for keyword in ['biology', 'bio', 'biolo']):
                html_file_path = "/Users/alex/NEW-ONT-TEST-3/dFourth-Step/Frontend/biology.html"
            elif any(keyword in object_key.lower() for keyword in ['computer', 'comp', 'compsci']):
                html_file_path = "/Users/alex/NEW-ONT-TEST-3/dFourth-Step/Frontend/compsci.html"
            else:
                html_file_path = "/Users/alex/NEW-ONT-TEST-3/dFourth-Step/Frontend/other.html"  # Default file

            # Append the URL and file name to the determined HTML file
            file_url = f"https://{second_s3_bucket_name}.s3.{second_aws_region}.amazonaws.com/{object_key}"
            with open(html_file_path, "a") as html_file:
                html_file.write(f'<p><a href="{file_url}" target="_blank">{object_key}</a></p>\n')

            print(f"File URL and name appended to {html_file_path}: {file_url}")

            # Delete the file locally
            try:
                os.remove(object_key)
                print(f"Local file '{object_key}' deleted successfully.")
            except Exception as e:
                logging.error(f"Error deleting local file '{object_key}': {e}")
    else:
        print("No PDF files found in the S3 bucket.")
else:
    print("No files found in the S3 bucket.")

# Logging setup
logging.basicConfig(level=logging.INFO)

