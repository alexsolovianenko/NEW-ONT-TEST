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
        '\u2019': "'",  # Right single quotation mark
        '\u2018': "'",  # Left single quotation mark
        '\u201c': '"',  # Left double quotation mark
        '\u201d': '"',  # Right double quotation mark
        '\u2013': '-',  # En dash
        '\u2014': '-',  # Em dash
        '\u2026': '...',  # Ellipsis
        '\u2192': '->',  # Right arrow
        '\u2190': '<-',  # Left arrow
        '\u2022': '-',   # Bullet
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return ''.join((c if ord(c) < 256 else '?') for c in text)



def extract_sections(text, section_names):
    """Extracts each section's text from the document, in order, by section header name."""
    # section_names: ["Section A", "Section B", ...]
    pattern = r'(?i)(' + '|'.join(re.escape(name) for name in section_names) + r')'
    # Find all section header matches
    matches = list(re.finditer(pattern, text))
    sections = {}
    for idx, match in enumerate(matches):
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        section_title = match.group(0)
        sections[section_title] = text[start:end].strip()
    return sections

def parse_document(text):
    """Sequentially process Section A, then B, then C, then D, saving after each."""
    # Find where Solutions start
    solutions_idx = text.lower().find('solutions')
    if solutions_idx != -1:
        questions_text = text[:solutions_idx]
        solutions_text = text[solutions_idx:]
    else:
        questions_text = text
        solutions_text = ''

    section_names = ["Section A", "Section B", "Section C", "Section D"]
    question_sections = extract_sections(questions_text, section_names)
    solution_sections = extract_sections(solutions_text, section_names)

    # Save each section after processing
    for sec in section_names:
        if sec in question_sections:
            filename = f"questions_{sec.replace(' ', '_')}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(question_sections[sec])
        if sec in solution_sections:
            filename = f"solutions_{sec.replace(' ', '_')}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(solution_sections[sec])

    # For compatibility with rest of code, parse as before
    questions = parse_questions(questions_text.splitlines())
    solutions = parse_solutions(solutions_text.splitlines())
    return questions, solutions


def parse_questions(lines):
    """Parse questions by section"""
    sections = {}
    current_section = None
    current_question = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            continue
        
        # Check for section headers (Section A, Section B, etc.)
        section_match = re.match(r'Section\s+([A-D])\s*[-–]\s*(.+)', stripped, re.IGNORECASE)
        if section_match:
            # Save previous question if exists
            if current_question and current_section:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(current_question)
            
            current_section = section_match.group(2).split('(')[0].strip()
            current_question = []
            continue
        
        # Skip instructional text in parentheses
        if stripped.startswith('(') and stripped.endswith(')'):
            continue
        
        # Check if this is a multiple choice option
        if re.match(r'^[a-d]\)', stripped):
            if current_question:
                current_question.append(stripped)
        else:
            # This is a new question
            if current_question and current_section:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(current_question)
            current_question = [stripped]
    
    # Save last question
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
        
        # Skip empty lines
        if not stripped:
            continue
        
        # Check for section headers
        section_match = re.match(r'Section\s+([A-D])\s*[-–]\s*(.+)', stripped, re.IGNORECASE)
        if section_match:
            current_section = section_match.group(2).split('(')[0].strip()
            sections[current_section] = []
            continue
        
        # Add solution lines
        if current_section and stripped:
            sections[current_section].append(stripped)
    
    return sections


def render_questions(pdf, sections):
    """Render questions to PDF"""
    question_number = 1
    
    for section_name, questions in sections.items():
        # Section header
        pdf.ln(12)
        pdf.set_font("Arial", style="B", size=15)
        pdf.set_fill_color(235, 233, 254)
        pdf.cell(0, 10, section_name + ":", ln=1, fill=True)
        pdf.set_font("Arial", size=12)
        
        for question_parts in questions:
            if not question_parts:
                continue
            
            # First line is the question
            question_text = question_parts[0]
            pdf.multi_cell(0, 10, f"{question_number}. {question_text}")
            
            # Remaining lines are options
            if len(question_parts) > 1:
                pdf.ln(1)
                for option in question_parts[1:]:
                    pdf.set_x(pdf.l_margin + 5)  # Indent
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
            pdf.multi_cell(0, 10, f"{answer_number}. {answer}")
            pdf.ln(5)
            answer_number += 1


if __name__ == "__main__":
    practice_test_path = r"C:\Users\solov\ontario test\practice_test.txt"
    
    if not os.path.exists(practice_test_path):
        print(f"Error: The file '{practice_test_path}' does not exist.")
        exit(1)

    # Load and clean text
    with open(practice_test_path, encoding="utf-8") as file:
        raw_text = file.read()
    
    cleaned_text = clean_text_for_pdf(raw_text)
    
    # Parse document
    questions, solutions = parse_document(cleaned_text)
    
    # Create PDF
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
    
    # First line with bold "Instructions:"
    pdf.set_font("Arial", style="B", size=12)
    bold_text = "Instructions:"
    pdf.set_font("Arial", style="", size=12)
    regular_text = " For each of the following, provide the most accurate and complete response."
    
    # Calculate centering
    pdf.set_font("Arial", style="B", size=12)
    bold_width = pdf.get_string_width(bold_text)
    pdf.set_font("Arial", style="", size=12)
    regular_width = pdf.get_string_width(regular_text)
    total_width = bold_width + regular_width
    start_x = left_margin + (box_width - total_width) / 2
    
    # Draw background
    pdf.set_x(left_margin)
    pdf.cell(box_width, 8, "", ln=0, fill=True)
    
    # Write bold text
    pdf.set_xy(start_x, pdf.get_y())
    pdf.set_font("Arial", style="B", size=12)
    pdf.cell(bold_width, 8, bold_text, ln=0)
    
    # Write regular text
    pdf.set_font("Arial", style="", size=12)
    pdf.cell(regular_width, 8, regular_text, ln=1)
    
    # Second line
    pdf.set_x(left_margin)
    pdf.cell(box_width, 8, "Explanations are at the end.", ln=1, fill=True, align='C')
    pdf.ln(6)

    # Render questions
    render_questions(pdf, questions)
    
    # Render solutions
    if solutions:
        render_solutions(pdf, solutions)

    # Save PDF
    output_pdf_path = "11-enlgish-1984-part1.pdf"
    pdf.output(output_pdf_path)
    print(f"Practice test saved to '{output_pdf_path}'.")

    # Upload to S3
    second_s3_client = boto3.client(
        's3',
        aws_access_key_id=second_aws_access_key_id,
        aws_secret_access_key=second_aws_secret_access_key,
        region_name=second_aws_region
    )

    try:
        second_s3_client.upload_file(
            Filename=output_pdf_path,
            Bucket=second_s3_bucket_name,
            Key=os.path.basename(output_pdf_path)
        )
        print(f"PDF successfully uploaded to S3 bucket '{second_s3_bucket_name}'.")
    except Exception as e:
        logging.error(f"Error uploading PDF to S3: {e}")

    # Cleanup
    try:
        os.remove(output_pdf_path)
        print("Temporary files deleted successfully.")
    except Exception as e:
        logging.error(f"Error deleting temporary files: {e}")