import re
from typing import List, Dict
from collections import Counter


def extract_keywords(text: str, top_n: int = 5) -> List[str]:
    """
    Extract top keywords from text using word frequency analysis.
    
    Args:
        text: Input text to analyze
        top_n: Number of top keywords to return (default 5)
        
    Returns:
        List of top keywords
    """
    # Convert to lowercase and extract words (alphanumeric only)
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    
    # Common stop words to filter out
    stop_words = {
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
        'from', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
        'might', 'can', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
        'you', 'your', 'i', 'my', 'me', 'he', 'she', 'him', 'her'
    }
    
    # Filter stop words and count frequencies
    filtered_words = [w for w in words if w not in stop_words]
    word_counts = Counter(filtered_words)
    
    # Return top N keywords
    return [word for word, count in word_counts.most_common(top_n)]


def calculate_confidence(text: str) -> float:
    """
    Calculate confidence score based on language patterns.
    
    Certainty indicators increase confidence, hedging decreases it.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Confidence score between 0.0 and 1.0
    """
    text_lower = text.lower()
    
    # Certainty indicators (increase confidence)
    certainty_patterns = [
        r'\b(clearly|obviously|definitely|certainly|surely|must|will)\b',
        r'\b(always|never|absolutely|undoubtedly|unquestionably)\b',
        r'\b(correct|right|true|exact|precise)\b'
    ]
    
    # Hedging indicators (decrease confidence)
    hedging_patterns = [
        r'\b(maybe|perhaps|possibly|probably|might|could|may)\b',
        r'\b(uncertain|unsure|unclear|ambiguous|vague)\b',
        r'\b(seems|appears|suggests|indicates)\b',
        r'\b(somewhat|slightly|fairly|rather|quite)\b',
        r'\b(I think|I believe|I guess|I assume)\b'
    ]
    
    # Question marks indicate uncertainty
    question_marks = text.count('?')
    
    # Count certainty indicators
    certainty_count = sum(
        len(re.findall(pattern, text_lower))
        for pattern in certainty_patterns
    )
    
    # Count hedging indicators
    hedging_count = sum(
        len(re.findall(pattern, text_lower))
        for pattern in hedging_patterns
    )
    
    # Base confidence
    base_confidence = 0.7
    
    # Adjust based on indicators
    confidence = base_confidence
    confidence += certainty_count * 0.05  # Each certainty word adds 5%
    confidence -= hedging_count * 0.08     # Each hedge word removes 8%
    confidence -= question_marks * 0.05    # Each question mark removes 5%
    
    # Clamp between 0.0 and 1.0
    return max(0.0, min(1.0, confidence))


def detect_linguistic_cues(text: str) -> Dict[str, bool]:
    """
    Detect linguistic cues that indicate relationships or dependencies.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dictionary of detected cues and their presence
    """
    text_lower = text.lower()
    
    return {
        'has_therefore': bool(re.search(r'\btherefore\b', text_lower)),
        'has_since': bool(re.search(r'\bsince\b', text_lower)),
        'has_this': bool(re.search(r'\bthis\b', text_lower)),
        'has_that': bool(re.search(r'\bthat\b', text_lower)),
        'has_because': bool(re.search(r'\bbecause\b', text_lower)),
        'has_so': bool(re.search(r'\bso\b', text_lower)),
        'has_thus': bool(re.search(r'\bthus\b', text_lower)),
        'has_hence': bool(re.search(r'\bhence\b', text_lower)),
    }


def count_shared_keywords(keywords1: List[str], keywords2: List[str]) -> int:
    """
    Count the number of shared keywords between two lists.
    
    Args:
        keywords1: First list of keywords
        keywords2: Second list of keywords
        
    Returns:
        Number of shared keywords
    """
    return len(set(keywords1) & set(keywords2))

