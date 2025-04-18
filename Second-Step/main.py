#Step 1: start | use python main.py

# Step 2: import libraries


# from reportlab.pdfgen import canvas (DK IF NEEDED)
#from PIL import Image  (DK IF NEEDED)
# from PyPDF2 import PdfReader #maybe remove bc of this ocr under


import boto3
import openai
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

from adobe.pdfservices.operation.auth.service_principal_credentials import ServicePrincipalCredentials
from adobe.pdfservices.operation.exception.exceptions import ServiceApiException, ServiceUsageException, SdkException
from adobe.pdfservices.operation.io.cloud_asset import CloudAsset
from adobe.pdfservices.operation.io.stream_asset import StreamAsset
from adobe.pdfservices.operation.pdf_services import PDFServices
from adobe.pdfservices.operation.pdf_services_media_type import PDFServicesMediaType
from adobe.pdfservices.operation.pdfjobs.jobs.export_pdf_job import ExportPDFJob
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_ocr_locale import ExportOCRLocale
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_pdf_params import ExportPDFParams
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_pdf_target_format import ExportPDFTargetFormat
from adobe.pdfservices.operation.pdfjobs.result.export_pdf_result import ExportPDFResult



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

# Fetch the latest file from S3
if 'Contents' in response:
    # Sort files by LastModified to get the latest file
    sorted_objects = sorted(response['Contents'], key=lambda obj: obj['LastModified'], reverse=True)
    latest_file_metadata = sorted_objects[0]  # Get the metadata of the most recently uploaded file
    object_key = latest_file_metadata['Key']  # Get the file name

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


# Initialize the logger
logging.basicConfig(level=logging.INFO)


#
# This sample illustrates how to export a PDF file to a Word (DOCX) file. The OCR processing is also performed on
# the input PDF file to extract text from images in the document.
#
# Refer to README.md for instructions on how to run the samples.
#
class ExportPDFToDOCXWithOCROption:
    def __init__(self):
        try:
            file = open(object_key)
            input_stream = file.read()
            file.close()

            # Initial setup, create credentials instance
            credentials = ServicePrincipalCredentials(
                client_id=os.getenv('PDF_SERVICES_CLIENT_ID'),
                client_secret=os.getenv('PDF_SERVICES_CLIENT_SECRET')
            )

            # Creates a PDF Services instance
            pdf_services = PDFServices(credentials=credentials)

            # Creates an asset(s) from source file(s) and upload
            input_asset = pdf_services.upload(input_stream=input_stream, mime_type=PDFServicesMediaType.PDF)

            # Create parameters for the job
            export_pdf_params = ExportPDFParams(target_format=ExportPDFTargetFormat.DOCX, ocr_lang=ExportOCRLocale.EN_US)

            # Creates a new job instance
            export_pdf_job = ExportPDFJob(input_asset=input_asset, export_pdf_params=export_pdf_params)

            # Submit the job and gets the job result
            location = pdf_services.submit(export_pdf_job)
            pdf_services_response = pdf_services.get_job_result(location, ExportPDFResult)

            # Get content from the resulting asset(s)
            result_asset: CloudAsset = pdf_services_response.get_result().get_asset()
            stream_asset: StreamAsset = pdf_services.get_content(result_asset)

            # Creates an output stream and copy stream asset's content to it
            output_file_path = self.create_output_file_path()
            with open(output_file_path, "wb") as file:
                file.write(stream_asset.get_input_stream())

        except (ServiceApiException, ServiceUsageException, SdkException) as e:
            logging.exception(f'Exception encountered while executing operation: {e}')

    # Generates a string containing a directory structure and file name for the output file
    @staticmethod
    def create_output_file_path() -> str:
        now = datetime.now()
        time_stamp = now.strftime("%Y-%m-%dT%H-%M-%S")
        os.makedirs("output/ExportPDFToDOCXWithOCROption", exist_ok=True)
        return f"output/ExportPDFToDOCXWithOCROption/export{time_stamp}.docx"


if __name__ == "__main__":
    ExportPDFToDOCXWithOCROption()





































'''
# Step 5: Download the file
    file_response = s3_client.get_object(Bucket=first_s3_bucket_name, Key=object_key)
    file_content = file_response['Body'].read()

    # Save the file locally with the same name as in the S3 bucket
    with open(object_key, "wb") as file:
        file.write(file_content)

    print(f"File downloaded successfully as '{object_key}'.")
'''






























'''
# Step 6: Read the PDF file (I THINK WE WANT OPENAI TO READ AS WELL)
def read_pdf(file_path):
    reader = PdfReader(file_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    return text
pdf_text = read_pdf(object_key)

read_pdf()
'''

'''
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

'''