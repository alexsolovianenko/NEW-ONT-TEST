import boto3
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
from fpdf import FPDF, HTMLMixin
import re

load_dotenv()
second_aws_access_key_id = os.getenv('SECOND_AWS_ACCESS_KEY_ID')
second_aws_secret_access_key = os.getenv('SECOND_AWS_SECRET_ACCESS_KEY')
second_aws_region = os.getenv('SECOND_AWS_REGION')
second_s3_bucket_name = os.getenv('SECOND_S3_BUCKET_NAME')


class StyledPDF(FPDF, HTMLMixin):
    def header(self):
        self.set_fill_color(91, 44, 250)  
        self.set_text_color(255, 255, 255)  
        self.set_font("Arial", style="B", size=10)
        self.set_text_color(0, 0, 0)
        self.set_xy(-40, 5)
        self.cell(30, 10, f"Page {self.page_no()}", align="R")

        # Title
        self.set_xy(10, 18)
        self.set_text_color(255, 255, 255)
        self.set_font("Arial", style="B", size=46)
        self.cell(0, 28, "Ontario Tests", ln=True, align="C", fill=True)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", style="", size=11)
        self.set_text_color(138, 153, 163)
        dev_notice = f"(c) {datetime.now().year} Ontario Tests | Early Development Version"
        self.cell(0, 10, dev_notice, align="C")
        self.set_text_color(150, 150, 150)


def clean_text_for_pdf(text):
    """Replace unicode characters that can't be encoded in latin-1"""
    replacements = {
        '\u2019': "'",
        '\u2018': "'",
        '\u201c': '"',
        '\u201d': '"',
        '\u2013': '-',
        '\u2014': '-',
        '\u2026': '...',
        '\u2192': '->',
        '\u2190': '<-',
        '\u2022': '-',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return ''.join((c if ord(c) < 256 else '?') for c in text)


def parse_document(text):
    """Parse document into questions and solutions sections"""
    solutions_idx = text.lower().find('solutions')
    if solutions_idx != -1:
        questions_text = text[:solutions_idx]
        solutions_text = text[solutions_idx:]
    else:
        questions_text = text
        solutions_text = ''

    questions = parse_questions(questions_text.splitlines())
    solutions = parse_solutions(solutions_text.splitlines())
    return questions, solutions


def parse_questions(lines):
    """Parse questions by section - supports BOTH multiple choice AND written response"""
    sections = {}
    current_section = None
    current_question = []
    
    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            continue
        
        # Match: Section A - Knowledge, Section B - Application, etc.
        section_match = re.match(r'Section\s+([A-D])\s*[-–]\s*(.+)', stripped, re.IGNORECASE)
        if section_match:
            if current_question and current_section:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(current_question)
            
            current_section = section_match.group(2).split('(')[0].strip()
            current_question = []
            continue
        
        if stripped.startswith('(') and stripped.endswith(')'):
            continue
        
        # Multiple choice option
        if re.match(r'^[a-d]\)', stripped):
            if current_question:
                current_question.append(stripped)
        else:
            # New question (could be multiple choice OR written response)
            if current_question and current_section:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(current_question)
            current_question = [stripped]
    
    if current_question and current_section:
        if current_section not in sections:
            sections[current_section] = []
        sections[current_section].append(current_question)
    
    return sections


def parse_solutions(lines):
    """Parse solutions by section"""
    sections = {}
    current_section = None
    
    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            continue
        
        section_match = re.match(r'Section\s+([A-D])\s*[-–]\s*(.+)', stripped, re.IGNORECASE)
        if section_match:
            current_section = section_match.group(2).split('(')[0].strip()
            sections[current_section] = []
            continue
        
        if current_section and stripped:
            sections[current_section].append(stripped)
    
    return sections


def render_questions(pdf, sections):
    """Render questions to PDF - handles BOTH multiple choice and written response"""
    question_number = 1
    
    for section_name, questions in sections.items():
        pdf.ln(12)
        pdf.set_font("Arial", style="B", size=15)
        pdf.set_fill_color(235, 233, 254)
        pdf.cell(0, 10, section_name + ":", ln=1, fill=True)
        pdf.set_font("Arial", size=12)
        
        for question_parts in questions:
            if not question_parts:
                continue
            
            question_text = question_parts[0]
            # Remove existing number if present (e.g., "1. What is..." -> "What is...")
            question_text = re.sub(r'^\d+\.\s*', '', question_text)
            pdf.multi_cell(0, 10, f"{question_number}. {question_text}")
            
            # If has options -> multiple choice, else -> written response
            if len(question_parts) > 1:
                pdf.ln(1)
                for option in question_parts[1:]:
                    pdf.set_x(pdf.l_margin + 5)
                    pdf.multi_cell(0, 8, option)
            
            pdf.ln(5)
            question_number += 1


def render_solutions(pdf, sections):
    """Render solutions to PDF"""
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=20)
    pdf.set_text_color(91, 44, 250)
    pdf.cell(0, 10, "Solutions", ln=True, align="C")
    pdf.ln(10)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=12)
    
    answer_number = 1
    
    for section_name, answers in sections.items():
        pdf.set_font("Arial", style="B", size=15)
        pdf.set_fill_color(235, 233, 254)
        pdf.cell(0, 10, section_name + ":", ln=1, fill=True)
        pdf.set_font("Arial", size=12)
        
        for answer in answers:
            # Remove existing number if present (e.g., "1. b) Transfer..." -> "b) Transfer...")
            answer_text = re.sub(r'^\d+\.\s*', '', answer)
            pdf.multi_cell(0, 10, f"{answer_number}. {answer_text}")
            pdf.ln(5)
            answer_number += 1


def create_pdf(input_file, output_filename):
    """Create PDF from text file"""
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            raw_text = f.read()
        
        cleaned_text = clean_text_for_pdf(raw_text)
        questions, solutions = parse_document(cleaned_text)
        
        if not questions:
            print(f"Error: No questions found in {input_file}")
            return False
        
        pdf = StyledPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Instructions box
        pdf.set_text_color(91, 44, 250)
        pdf.set_font("Arial", style="B", size=18)
        pdf.ln(2)
        pdf.set_fill_color(240, 240, 255)
        pdf.set_text_color(0, 0, 0)
        left_margin = 10
        right_margin = 10
        box_width = pdf.w - left_margin - right_margin
        
        pdf.set_font("Arial", style="B", size=12)
        bold_text = "Instructions:"
        pdf.set_font("Arial", style="", size=12)
        regular_text = " For each of the following, provide the most accurate and complete response."
        
        pdf.set_font("Arial", style="B", size=12)
        bold_width = pdf.get_string_width(bold_text)
        pdf.set_font("Arial", style="", size=12)
        regular_width = pdf.get_string_width(regular_text)
        total_width = bold_width + regular_width
        start_x = left_margin + (box_width - total_width) / 2
        
        pdf.set_x(left_margin)
        pdf.cell(box_width, 8, "", ln=0, fill=True)
        
        pdf.set_xy(start_x, pdf.get_y())
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(bold_width, 8, bold_text, ln=0)
        
        pdf.set_font("Arial", style="", size=12)
        pdf.cell(regular_width, 8, regular_text, ln=1)
        
        pdf.set_x(left_margin)
        pdf.cell(box_width, 8, "Explanations are at the end.", ln=1, fill=True, align='C')
        pdf.ln(6)

        render_questions(pdf, questions)
        
        if solutions:
            render_solutions(pdf, solutions)

        pdf.output(output_filename)
        print(f"✓ PDF created successfully: {output_filename}")
        return True
        
    except Exception as e:
        print(f"Error creating PDF: {e}")
        import traceback
        traceback.print_exc()
        return False


def upload_to_s3(filename):
    """Upload file to S3"""
    if not all([second_aws_access_key_id, second_aws_secret_access_key, second_s3_bucket_name]):
        print(f"⚠ S3 not configured. PDF saved locally: {filename}")
        return False
    
    second_s3_client = boto3.client(
        's3',
        aws_access_key_id=second_aws_access_key_id,
        aws_secret_access_key=second_aws_secret_access_key
    )

    try:
        second_s3_client.upload_file(
            Filename=filename,
            Bucket=second_s3_bucket_name,
            Key=os.path.basename(filename)
        )
        print(f"✓ PDF successfully uploaded to S3 bucket '{second_s3_bucket_name}' as '{os.path.basename(filename)}'.")
        
        # Delete local PDF file after successful upload
        try:
            os.remove(filename)
            print(f"✓ Temporary file '{filename}' deleted successfully.")
        except Exception as e:
            logging.error(f"Error deleting temporary file: {e}")
        
        return True
        
    except Exception as e:
        logging.error(f"Error uploading PDF to S3: {e}")
        print(f"✗ S3 upload failed: {e}")
        return False


if __name__ == "__main__":
    import sys
    
    # =================================================================
    # COMMAND LINE USAGE
    # =================================================================
    # python test_clean.py downloadpdf 10 compsci unit1    → Create PDF with custom name
    # python test_clean.py downloadpdf                     → Test: Create test-output.pdf
    # python test_clean.py 11 chemistry unit2              → Create & upload to S3
    # =================================================================
    
    if len(sys.argv) > 1 and sys.argv[1] == "downloadpdf":
        # TEST MODE: Create PDF and keep it locally (don't upload, don't delete)
        print("\n" + "="*60)
        print("TEST MODE: Creating PDF locally (no S3 upload)")
        print("="*60 + "\n")
        
        INPUT_FILE = "textfortest.txt"
        
        # Check if custom naming is provided: grade subject unit
        if len(sys.argv) >= 5:
            grade = sys.argv[2]
            subject = sys.argv[3]
            unit = sys.argv[4]
            OUTPUT_PDF = f"{grade}-{subject}-{unit}.pdf"
            print(f"Creating PDF: {OUTPUT_PDF}\n")
        else:
            OUTPUT_PDF = "test-output.pdf"
        
        if create_pdf(INPUT_FILE, OUTPUT_PDF):
            print(f"\n✓ SUCCESS! PDF saved as: {OUTPUT_PDF}")
            print(f"  Check the file to verify formatting is correct.\n")
        else:
            print("\n✗ FAILED. Check your textfortest.txt format.\n")
    
    else:
        # NORMAL MODE: Create PDF and upload to S3
        INPUT_FILE = "textfortest.txt"
        
        # Check if custom naming is provided: grade subject unit
        if len(sys.argv) >= 4:
            grade = sys.argv[1]
            subject = sys.argv[2]
            unit = sys.argv[3]
            OUTPUT_PDF = f"{grade}-{subject}-{unit}.pdf"
        else:
            OUTPUT_PDF = "11-chemistry-unit1.pdf"
        
        print(f"\nCreating PDF: {OUTPUT_PDF}")
        if create_pdf(INPUT_FILE, OUTPUT_PDF):
            upload_to_s3(OUTPUT_PDF)
        else:
            print("\n✗ Failed to create PDF. Check your textfortest.txt file format.")