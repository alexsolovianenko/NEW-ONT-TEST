import boto3
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import json

load_dotenv()
second_aws_access_key_id = os.getenv('SECOND_AWS_ACCESS_KEY_ID')
second_aws_secret_access_key = os.getenv('SECOND_AWS_SECRET_ACCESS_KEY')
second_aws_region = os.getenv('SECOND_AWS_REGION')
second_s3_bucket_name = os.getenv('SECOND_S3_BUCKET_NAME')

s3_client = boto3.client(
    's3',
    aws_access_key_id=second_aws_access_key_id,
    aws_secret_access_key=second_aws_secret_access_key,
)
response = s3_client.list_objects_v2(Bucket=second_s3_bucket_name)

subject_files = {}

if 'Contents' in response:
    pdf_files = [obj for obj in response['Contents'] if obj['Key'].lower().endswith('.pdf')]

    if pdf_files:
        for pdf_file in pdf_files:
            object_key = pdf_file['Key']
            print(f"Fetching file: {object_key}")

            file_response = s3_client.get_object(Bucket=second_s3_bucket_name, Key=object_key)
            file_content = file_response['Body'].read()

            with open(object_key, "wb") as file:
                file.write(file_content)

            print(f"File downloaded successfully as '{object_key}'.")

            print(f"Processing file: {object_key}")
            subject_key = None
            if any(keyword in object_key.lower() for keyword in ['biology', 'bio', 'biolo']):
                subject_key = "biology"
            elif any(keyword in object_key.lower() for keyword in ['computer', 'comp', 'compsci']):
                subject_key = "compsci"
            elif any(keyword in object_key.lower() for keyword in ['accounting']):
                subject_key = "accounting"
            elif any(keyword in object_key.lower() for keyword in ['religion']):
                subject_key = "religion"
            elif any(keyword in object_key.lower() for keyword in ['general science', 'science', 'generalscience']):
                subject_key = "generalsci"
            elif any(keyword in object_key.lower() for keyword in ['english', 'eng']):
                subject_key = "english"
            elif any(keyword in object_key.lower() for keyword in ['chemistry', 'chem']):
                subject_key = "chemistry"
            elif any(keyword in object_key.lower() for keyword in ['physics']):
                subject_key = "physics"
            elif any(keyword in object_key.lower() for keyword in ['marketing', 'market']):
                subject_key = "marketing"
            elif any(keyword in object_key.lower() for keyword in ['geography', 'geo']):
                subject_key = "geography"
            elif any(keyword in object_key.lower() for keyword in ['math', 'functions']):
                subject_key = "math"
            else:
                print(f'Cant find which subject to append to for file: {object_key}')
                continue

            file_url = f"https://{second_s3_bucket_name}.s3.{second_aws_region}.amazonaws.com/{object_key}"
            file_entry = {
                "name": object_key,
                "url": file_url
            }

            if subject_key not in subject_files:
                subject_files[subject_key] = []
            subject_files[subject_key].append(file_entry)

            if 'to_delete' not in locals():
                to_delete = []
            to_delete.append(object_key)

        output_dir = os.path.join(os.path.dirname(__file__), "..", "Frontend")
        output_dir = os.path.abspath(output_dir)
        os.makedirs(output_dir, exist_ok=True)
        for subject, files in subject_files.items():
            json_path = os.path.join(output_dir, f"{subject}.json")
            existing = []
            if os.path.exists(json_path):
                with open(json_path, "r") as json_file:
                    try:
                        existing = json.load(json_file)
                    except Exception:
                        existing = []
            existing_names = set(entry["name"] for entry in existing)
            new_files = [f for f in files if f["name"] not in existing_names]
            all_files = existing + new_files
            with open(json_path, "w") as json_file:
                json.dump(all_files, json_file, indent=2)
            print(f"Wrote {len(new_files)} new files to {json_path} (total: {len(all_files)})")

        for filename in to_delete:
            try:
                os.remove(filename)
                print(f"Local file '{filename}' deleted successfully.")
            except Exception as e:
                logging.error(f"Error deleting local file '{filename}': {e}")
    else:
        print("No PDF files found in the S3 bucket.")
else:
    print("No files found in the S3 bucket.")

logging.basicConfig(level=logging.INFO)

