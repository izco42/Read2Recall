import fitz  # PyMuPDF
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastapi import UploadFile

async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    contents = await pdf_file.read()
    with fitz.open(stream=contents, filetype="pdf") as doc:
        return "\n\n".join(page.get_text() for page in doc)

def chunk_text(text: str, chunk_size=800, overlap=150) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", "!", "?", ",", " "]
    )
    return splitter.split_text(text)
