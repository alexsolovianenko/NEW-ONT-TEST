from fpdf import FPDF, HTMLMixin
import os
import random


class StyledPDF(FPDF, HTMLMixin):
    def header(self):
        self.set_fill_color(91, 44, 250)  # Purple background
        self.set_text_color(255, 255, 255)  # White text
        # Add Lexend Black font if not already added
        if not hasattr(self, '_lexend_black_added'):
            self.add_font("Lexend", "B", "Lexend-Black.ttf", uni=True)
            self._lexend_black_added = True
        # Page number at top right (y=5) with black and EB Garamond Medium
        self.add_font("EBGaramond", "M", "EBGaramond-Medium.ttf", uni=True)
        self.set_font("EBGaramond", style="M", size=10)
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
        # Reset color for other footer elements if needed
        self.set_text_color(150, 150, 150)

if __name__ == "__main__":
    random_things = [
        "Banana phone!",
        "42 is the answer.",
        "The quick brown fox jumps over the lazy dog.",
        "Hello, world!",
        "Random number: " + str(random.randint(1, 100)),
        "Python is fun!",
        "Ontario Practice Test Example",
        "Lorem ipsum dolor sit amet."
    ]
    for _ in range(5):
        print(random.choice(random_things))

    print("Generated Practice Test:")


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


    # Instructions block: "Instructions:" (ExtraBold) + first part (Medium) on same line, rest on next line, bigger font
    pdf.set_fill_color(240, 240, 255)
    pdf.set_text_color(0, 0, 0)
    left_margin = 6
    right_margin = 20
    box_width = pdf.w - left_margin - right_margin
    pdf.set_x(left_margin)
    pdf.set_font("EBGaramond", style="XB", size=12)  # Bigger font size
    instr_text = "Instructions:"
    instr_width = pdf.get_string_width(instr_text + " ")
    pdf.cell(instr_width, 8, instr_text, ln=0, fill=True)
    pdf.set_font("EBGaramond", style="M", size=12)  # Bigger font size
    first_line = "For each of the following, provide the most accurate and complete response. Explanations are provided"
    pdf.cell(box_width - instr_width, 8, first_line, ln=1, fill=True)
    pdf.set_x(left_margin)
    pdf.cell(box_width, 8, "at the end.", ln=1, fill=True)
    pdf.ln(6)

    # Add section headers in the same font as instructions, two lines apart
    section_headers = ["Knowledge", "Thinking", "Application", "Communication"]
    for section in section_headers:
        pdf.ln(12)
        pdf.set_font("EBGaramond", style="XB", size=14)
        pdf.cell(pdf.get_string_width(section + " "), 8, section + ":", ln=0, fill=True)
        pdf.set_font("EBGaramond", style="M", size=12)
        pdf.cell(0, 8, "", ln=1, fill=True)

    section_titles = ["Thinking", "Communication", "Knowledge", "Application"]
    current_section = None

    for line in random_things:
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

    # Save and open the PDF
    output_pdf_path = "random_output.pdf"
    pdf.output(output_pdf_path)
    print(f"PDF saved to {output_pdf_path}")

    try:
        if os.name == "nt":
            os.startfile(output_pdf_path)
        elif os.name == "posix":
            import subprocess
            subprocess.run(["xdg-open", output_pdf_path])
    except Exception as e:
        print(f"Could not open PDF automatically: {e}")
