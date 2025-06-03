import boto3
import openai
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
from docx import Document
from fpdf import FPDF, HTMLMixin
from adobe.pdfservices.operation.auth.service_principal_credentials import ServicePrincipalCredentials
from adobe.pdfservices.operation.exception.exceptions import ServiceApiException, ServiceUsageException, SdkException
from adobe.pdfservices.operation.io.cloud_asset import CloudAsset
from adobe.pdfservices.operation.io.stream_asset import StreamAsset
from adobe.pdfservices.operation.pdf_services import PDFServices
from adobe.pdfservices.operation.pdf_services_media_type import PDFServicesMediaType
from adobe.pdfservices.operation.pdfjobs.jobs.export_pdf_job import ExportPDFJob
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_pdf_params import ExportPDFParams
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_pdf_target_format import ExportPDFTargetFormat
from adobe.pdfservices.operation.pdfjobs.params.export_pdf.export_ocr_locale import ExportOCRLocale
from adobe.pdfservices.operation.pdfjobs.result.export_pdf_result import ExportPDFResult

load_dotenv()
first_aws_access_key_id = os.getenv('FIRST_AWS_ACCESS_KEY_ID')  
first_aws_secret_access_key = os.getenv('FIRST_AWS_SECRET_ACCESS_KEY')
first_aws_region = os.getenv('FIRST_AWS_REGION')  
first_s3_bucket_name = os.getenv('FIRST_S3_BUCKET_NAME')  
second_aws_access_key_id = os.getenv('SECOND_AWS_ACCESS_KEY_ID')
second_aws_secret_access_key = os.getenv('SECOND_AWS_SECRET_ACCESS_KEY')
second_aws_region = os.getenv('SECOND_AWS_REGION')
second_s3_bucket_name = os.getenv('SECOND_S3_BUCKET_NAME')
openai.api_key = os.getenv('OPENAI_API_KEY')

s3_client = boto3.client(
    's3',
    aws_access_key_id=first_aws_access_key_id,
    aws_secret_access_key=first_aws_secret_access_key
)
response = s3_client.list_objects_v2(Bucket=first_s3_bucket_name)

if 'Contents' in response:
    sorted_objects = sorted(response['Contents'], key=lambda obj: obj['LastModified'], reverse=True)
    latest_file_metadata = sorted_objects[0]
    object_key = latest_file_metadata['Key']

    print(f"Fetching the latest file: {object_key}")

    file_response = s3_client.get_object(Bucket=first_s3_bucket_name, Key=object_key)
    file_content = file_response['Body'].read()

    with open(object_key, "wb") as file:
        file.write(file_content)

    print(f"File downloaded successfully as '{object_key}'.")
else:
    print("No files found in the S3 bucket.")

logging.basicConfig(level=logging.INFO)

class ExportPDFToDOCXWithOCROption:
    def __init__(self, file_path):
        try:
            global docx_output_file_path
            with open(file_path, 'rb') as file:
                input_stream = file.read()

            credentials = ServicePrincipalCredentials(
                client_id=os.getenv('PDF_SERVICES_CLIENT_ID'),
                client_secret=os.getenv('PDF_SERVICES_CLIENT_SECRET')
            )

            pdf_services = PDFServices(credentials=credentials)

            input_asset = pdf_services.upload(input_stream=input_stream, mime_type=PDFServicesMediaType.PDF)

            export_pdf_params = ExportPDFParams(target_format=ExportPDFTargetFormat.DOCX, ocr_lang=ExportOCRLocale.EN_US)

            export_pdf_job = ExportPDFJob(input_asset=input_asset, export_pdf_params=export_pdf_params)

            location = pdf_services.submit(export_pdf_job)
            pdf_services_response = pdf_services.get_job_result(location, ExportPDFResult)

            result_asset: CloudAsset = pdf_services_response.get_result().get_asset()
            stream_asset: StreamAsset = pdf_services.get_content(result_asset)

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            docx_output_file_path = f'output/ExportPDFToDOCXWithOCROption/export_{timestamp}.docx'
            os.makedirs(os.path.dirname(docx_output_file_path), exist_ok=True)

            with open(docx_output_file_path, "wb") as file:
                file.write(stream_asset.get_input_stream())

            print(f"PDF successfully converted to DOCX. File saved as '{docx_output_file_path}'.")

        except (ServiceApiException, ServiceUsageException, SdkException) as e:
            logging.exception(f'Exception encountered while executing operation: {e}')

def extract_questions_from_docx(docx_file_path):
    try:
        document = Document(docx_file_path)
        docx_content = "\n".join([paragraph.text for paragraph in document.paragraphs])

        prompt = f"""
You are an AI tutor tasked with creating a structured practice test based on the provided educational material. The test should follow the Ontario curriculum format and include the following sections:

1. **Thinking**: 5-7 questions that require critical thinking and problem-solving skills.
2. **Communication**: 5-7 questions that assess the ability to explain concepts clearly and effectively.
3. **Knowledge**: 5-7 questions that test factual recall and understanding of the material.
4. **Application**: 5-7 questions that require applying knowledge to new situations or solving practical problems.

- Ensure the questions are relevant to the content provided in the document.
- Rewrite the questions to align with the curriculum but maintain the core concepts.
- If the document references images or diagrams, include placeholders for them (e.g., "[Refer to Figure 1]") and ensure the questions reference these appropriately.
- Provide clear and accurate answers for each question.
- Format the output as a structured test with numbered questions and labeled sections.

Here is the content of the document:
{docx_content}
"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a high school teacher creating a structured practice test."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.5
        )
        return response['choices'][0]['message']['content']
    except openai.error.OpenAIError as e:
        logging.error(f"Error extracting questions with OpenAI: {e}")
        return "Error: Unable to process the request."
    except Exception as e:
        logging.error(f"Error reading DOCX file: {e}")
        return "Error: Unable to read the DOCX file."

class StyledPDF(FPDF, HTMLMixin):
    def header(self):
        self.set_fill_color(91, 44, 250)  # Purple background
        self.set_text_color(255, 255, 255)  # White text
        # Add Lexend Black font if not already added
        if not hasattr(self, '_lexend_black_added'):
            self.add_font("Lexend", "B", "Lexend-Black.ttf", uni=True)
            self._lexend_black_added = True
        # Page number at top right (y=5) with Lexend SemiBold
        self.add_font("Lexend", "I", "Lexend-SemiBold.ttf", uni=True)
        self.set_font("Lexend", style="I", size=10)
        self.set_text_color(0, 0, 0)
        self.set_xy(-40, 5)
        self.cell(30, 10, f"Page {self.page_no()}", align="R")
        # Title
        self.set_xy(10, 18)
        self.set_text_color(255, 255, 255)
        self.set_font("Lexend", style="B", size=46)
        self.cell(0, 28, "Ontario Tests", ln=True, align="C", fill=True)
        self.ln(5)

    def footer(self):
        # Copyright/development notice at center bottom
        from datetime import datetime
        self.set_y(-15)
        self.set_font("Lexend", style="", size=11)
        self.set_text_color(138, 153, 163)  # #8a99a3
        dev_notice = f"© {datetime.now().year} Ontario Tests | Early Development Version"
        self.cell(0, 10, dev_notice, align="C")
        self.set_text_color(150, 150, 150)

if __name__ == "__main__":
    ExportPDFToDOCXWithOCROption(object_key)

    questions = extract_questions_from_docx(docx_output_file_path)
    print("Generated Practice Test:", questions)

    # Extract subject and grade from the file name (assuming a naming convention like "Math_Grade10.pdf")
    file_name_parts = os.path.splitext(object_key)[0].split("_")
    subject = file_name_parts[0] if len(file_name_parts) > 0 else "Subject"
    grade = file_name_parts[1] if len(file_name_parts) > 1 else "Grade"

    pdf = StyledPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    # Add Lexend fonts if not already added
    pdf.add_font("Lexend", "", "Lexend-SemiBold.ttf", uni=True)
    pdf.add_font("Lexend", "B", "Lexend-Black.ttf", uni=True)
    pdf.add_font("Lexend", "I", "Lexend-SemiBold.ttf", uni=True)
    # Add EB Garamond fonts for instructions (ExtraBold and Medium only)
    pdf.add_font("EBGaramond", "XB", "EBGaramond-ExtraBold.ttf", uni=True)
    pdf.add_font("EBGaramond", "M", "EBGaramond-Medium.ttf", uni=True)

    pdf.add_page()  # Ensure a page exists before any drawing

    # Modern title
    pdf.set_text_color(91, 44, 250)
    pdf.set_font("Lexend", style="B", size=18)
    pdf.ln(2)  # Reduce spacing before instructions

    # Instructions block: "Instructions:" (Lexend Black) + rest (EB Garamond Medium), bigger font
    pdf.set_fill_color(240, 240, 255)
    pdf.set_text_color(0, 0, 0)
    left_margin = 5
    right_margin = 20
    box_width = pdf.w - left_margin - right_margin
    pdf.set_x(left_margin)
    pdf.set_font("Lexend", style="B", size=12)
    instr_text = "Instructions:"
    instr_width = pdf.get_string_width(instr_text + " ")
    pdf.cell(instr_width, 8, instr_text, ln=0, fill=True)
    pdf.set_font("EBGaramond", style="M", size=12)
    first_line = "For each of the following, provide the most accurate and complete response. Explanations are provided"
    pdf.cell(box_width - instr_width, 8, first_line, ln=1, fill=True)
    pdf.set_x(left_margin)
    pdf.cell(box_width, 8, "at the end.", ln=1, fill=True)
    pdf.ln(6)

    # Add section headers in Lexend SemiBold, two lines apart
    section_headers = ["Knowledge", "Thinking", "Application", "Communication"]
    for section in section_headers:
        pdf.ln(12)
        pdf.set_font("Lexend", style="", size=15)  # Lexend SemiBold, bigger font size
        pdf.cell(0, 10, section + ":", ln=1, fill=True)

    # Use extracted questions for the rest of the PDF
    section_titles = ["Thinking", "Communication", "Knowledge", "Application"]
    question_lines = questions.split("\n")
    current_section = None

    for line in question_lines:
        if line.strip() in section_titles:
            current_section = line.strip()
            pdf.set_fill_color(220, 230, 255)
            pdf.set_text_color(40, 40, 120)
            pdf.set_font("Lexend", style="B", size=14)
            pdf.cell(0, 10, f"Section: {current_section}", ln=True, fill=True)
            pdf.ln(4)
            pdf.set_font("Lexend", size=12)
            pdf.set_text_color(0, 0, 0)
        elif line.strip():
            if line.startswith("[Refer to Figure"):
                pdf.set_font("Lexend", style="I", size=12)
                pdf.set_text_color(80, 80, 80)
                pdf.multi_cell(0, 10, line)
                pdf.ln(2)
                pdf.set_font("Lexend", size=12)
                pdf.set_text_color(0, 0, 0)
            else:
                pdf.multi_cell(0, 10, line)
                pdf.ln(2)

    pdf.add_page()
    pdf.set_font("Lexend", style="B", size=20)
    pdf.set_text_color(91, 44, 250)
    pdf.cell(0, 10, "Solutions", ln=True, align="C")
    pdf.ln(10)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Lexend", size=12)

    original_file_name = os.path.splitext(object_key)[0]
    output_pdf_path = f"{original_file_name}_Practice_Test.pdf"
    pdf.output(output_pdf_path)
    print(f"Practice test saved to '{output_pdf_path}'.")

    second_s3_client = boto3.client(
        's3',
        aws_access_key_id=second_aws_access_key_id,
        aws_secret_access_key=second_aws_secret_access_key
    )

    try:
        second_s3_client.upload_file(
            Filename=output_pdf_path,
            Bucket=second_s3_bucket_name,
            Key=os.path.basename(output_pdf_path)
        )
        print(f"PDF successfully uploaded to S3 bucket '{second_s3_bucket_name}' as '{os.path.basename(output_pdf_path)}'.")
    except Exception as e:
        logging.error(f"Error uploading PDF to S3: {e}")

    try:
        os.remove(output_pdf_path)
        os.remove(object_key)
        os.remove(docx_output_file_path)
        print("Temporary files deleted successfully.")
    except Exception as e:
        logging.error(f"Error deleting temporary files: {e}")