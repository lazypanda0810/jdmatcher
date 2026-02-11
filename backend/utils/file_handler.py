"""
utils/file_handler.py - Secure File Upload Utilities
------------------------------------------------------
Handles:
  - MIME type and extension validation for uploaded resumes
  - Secure filename generation (prevents path traversal)
  - Text extraction from PDF and DOCX files

Supported formats: .pdf, .docx
"""

import os
import uuid

import PyPDF2
import docx
from werkzeug.utils import secure_filename

from config import Config


def allowed_file(filename):
    """
    Check whether the uploaded file has a permitted extension.

    Args:
        filename (str): Original filename from the upload.

    Returns:
        bool: True if the extension is in ALLOWED_EXTENSIONS.
    """
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


def save_uploaded_file(file_storage):
    """
    Validate, rename, and persist an uploaded file to disk.

    Security measures:
    - Checks extension against allowlist.
    - Uses werkzeug's secure_filename to sanitize.
    - Prepends a UUID to prevent filename collisions.

    Args:
        file_storage: Flask FileStorage object from request.files.

    Returns:
        tuple: (saved_filepath, original_filename) or (None, None) on failure.
    """
    if not file_storage or file_storage.filename == "":
        return None, None

    original_filename = file_storage.filename

    if not allowed_file(original_filename):
        return None, None

    # Secure the filename and add a UUID prefix for uniqueness
    safe_name = secure_filename(original_filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"

    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_name)
    file_storage.save(filepath)

    return filepath, original_filename


def extract_text_from_pdf(filepath):
    """
    Extract all text content from a PDF file.

    Uses PyPDF2 to iterate through every page and concatenate text.

    Args:
        filepath (str): Absolute path to the PDF file.

    Returns:
        str: Concatenated text from all pages.
    """
    text = ""
    try:
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"[ERROR] PDF extraction failed: {e}")
    return text.strip()


def extract_text_from_docx(filepath):
    """
    Extract all text content from a DOCX file.

    Uses python-docx to iterate through paragraphs.

    Args:
        filepath (str): Absolute path to the DOCX file.

    Returns:
        str: Concatenated paragraph text.
    """
    text = ""
    try:
        doc = docx.Document(filepath)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"[ERROR] DOCX extraction failed: {e}")
    return text.strip()


def extract_text(filepath):
    """
    Dispatcher: extract text based on file extension.

    Args:
        filepath (str): Path to uploaded resume file.

    Returns:
        str: Extracted text content.
    """
    ext = filepath.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    elif ext == "docx":
        return extract_text_from_docx(filepath)
    else:
        return ""
