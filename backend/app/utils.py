import PyPDF2
from docx import Document as DocxDocument
import re
import collections

def extract_text_from_file(file_path: str) -> str:
    """
    Extracts text content from a file based on its extension.
    Supports .txt, .pdf, and .docx files.
    """
    file_extension = file_path.split('.')[-1].lower()
    text = ""

    if file_extension == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    elif file_extension == 'pdf':
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text()
    elif file_extension == 'docx':
        doc = DocxDocument(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    
    return text.strip()

# New function for metadata extraction
def extract_metadata(text: str) -> dict:
    """
    Extracts title, author, and date using a rule-based approach.
    """
    metadata = {
        "title": "Untitled Document",
        "author": None,
        "date": None
    }
    
    # [cite_start]Extract title: Look for the first bold line/sentence[cite: 192].
    # This is a simplified regex; a real implementation might need a library like PyMuPDF for bold text.
    title_match = re.search(r'^(.*?)\n', text.strip(), re.MULTILINE)
    if title_match:
        metadata["title"] = title_match.group(1).strip()
    
    # [cite_start]Extract author: Look for "Author:", "By:", or similar keywords[cite: 193].
    author_match = re.search(r'(?:Author:|By:)\s*(.+)', text, re.IGNORECASE)
    if author_match:
        metadata["author"] = author_match.group(1).strip()
        
    # [cite_start]Extract date: Use regex for common date formats[cite: 194].
    date_match = re.search(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b\s+\d{1,2},\s+\d{4}', text, re.IGNORECASE)
    if date_match:
        metadata["date"] = date_match.group(0).strip()

    return metadata

# New function for summarization
def extract_summary(text: str, num_sentences: int = 3) -> str:
    """
    Generates an extractive summary by picking the top sentences based on word frequency.
    """
    # 1. Tokenize text into sentences and words
    sentences = re.split(r'(?<=[.!?])\s+', text)
    words = re.findall(r'\b\w+\b', text.lower())
    
    # [cite_start]2. Calculate word frequencies [cite: 198]
    word_freq = collections.Counter(words)
    
    # 3. Score sentences based on word frequency
    sentence_scores = {}
    for i, sentence in enumerate(sentences):
        for word in re.findall(r'\b\w+\b', sentence.lower()):
            if word in word_freq:
                if i not in sentence_scores:
                    sentence_scores[i] = word_freq[word]
                else:
                    sentence_scores[i] += word_freq[word]
                    
    # [cite_start]4. Pick top sentences [cite: 199]
    top_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    top_sentences.sort()
    
    summary = " ".join([sentences[i] for i in top_sentences])
    
    return summary