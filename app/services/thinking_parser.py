import re
import uuid
from typing import List, AsyncGenerator, Optional
from app.models.thought_node import ThoughtNode, ThoughtType, Position
from app.utils.text_analysis import (
    extract_keywords,
    calculate_confidence,
    detect_linguistic_cues,
    count_shared_keywords
)


class ThinkingParser:
    """Parser to convert raw thinking text into structured thought nodes."""
    
    def __init__(self, session_id: str):
        """
        Initialize the parser for a specific session.
        
        Args:
            session_id: Unique session identifier
        """
        self.session_id = session_id
        self.node_counter = 0
        self.recent_nodes: List[ThoughtNode] = []  # Keep last 5 nodes for dependency detection
        self.x_position = 0
        self.y_position = 0
        self.accumulated_text = ""
    
    def generate_node_id(self) -> str:
        """
        Generate a unique node ID.
        
        Returns:
            Unique identifier string
        """
        self.node_counter += 1
        return f"{self.session_id}_node_{self.node_counter}"
    
    def classify_thought_type(self, text: str) -> ThoughtType:
        """
        Classify thought type using keyword heuristics.
        
        Args:
            text: Thought segment text
            
        Returns:
            ThoughtType classification
        """
        text_lower = text.lower()
        
        # Analysis patterns
        analysis_keywords = [
            'need to', 'first', "let's", 'consider', 'analyze',
            'understand', 'examine', 'look at', 'review', 'assess'
        ]
        
        # Decision patterns
        decision_keywords = [
            'will use', 'best approach', 'should', 'choose',
            'decide', 'select', 'opt for', 'go with', 'prefer'
        ]
        
        # Verification patterns
        verification_keywords = [
            'check', 'verify', 'confirm', 'ensure', 'test',
            'validate', 'prove', 'demonstrate', 'show that'
        ]
        
        # Alternative patterns
        alternative_keywords = [
            'alternatively', 'another option', 'could also', 'or',
            'instead', 'different approach', 'other way', 'else'
        ]
        
        # Implementation patterns
        implementation_keywords = [
            'implement', 'code', 'function', 'class', 'def',
            'create', 'build', 'write', 'develop', 'construct'
        ]
        
        # Count matches for each type
        scores = {
            ThoughtType.IMPLEMENTATION: sum(1 for kw in implementation_keywords if kw in text_lower),
            ThoughtType.VERIFICATION: sum(1 for kw in verification_keywords if kw in text_lower),
            ThoughtType.DECISION: sum(1 for kw in decision_keywords if kw in text_lower),
            ThoughtType.ALTERNATIVE: sum(1 for kw in alternative_keywords if kw in text_lower),
            ThoughtType.ANALYSIS: sum(1 for kw in analysis_keywords if kw in text_lower),
        }
        
        # Return type with highest score, default to ANALYSIS
        max_type = max(scores.items(), key=lambda x: x[1])
        return max_type[0] if max_type[1] > 0 else ThoughtType.ANALYSIS
    
    def split_into_segments(self, text: str, min_words: int = 20) -> List[str]:
        """
        Split thinking text into logical segments.
        
        Args:
            text: Raw thinking text
            min_words: Minimum words per segment
            
        Returns:
            List of text segments
        """
        # Split by sentence boundaries
        sentences = re.split(r'[.!?]+\s+', text)
        
        segments = []
        current_segment = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Add to current segment
            if current_segment:
                current_segment += ". " + sentence
            else:
                current_segment = sentence
            
            # Check if we have enough words
            word_count = len(current_segment.split())
            if word_count >= min_words:
                segments.append(current_segment)
                current_segment = ""
        
        # Add remaining text if substantial
        if current_segment and len(current_segment.split()) >= min_words // 2:
            segments.append(current_segment)
        
        return segments
    
    def detect_dependencies(self, node: ThoughtNode) -> List[str]:
        """
        Detect dependencies on previous nodes.
        
        Args:
            node: Current thought node
            
        Returns:
            List of node IDs this node depends on
        """
        dependencies = []
        
        # Check linguistic cues
        cues = detect_linguistic_cues(node.content)
        
        # If we have referential cues, link to previous node
        if (cues['has_this'] or cues['has_that'] or cues['has_therefore'] or 
            cues['has_since'] or cues['has_because']):
            if self.recent_nodes:
                dependencies.append(self.recent_nodes[-1].id)
        
        # Check for shared keywords with recent nodes
        for recent_node in self.recent_nodes[-3:]:  # Check last 3 nodes
            shared_count = count_shared_keywords(node.keywords, recent_node.keywords)
            if shared_count >= 2:  # 2+ shared keywords
                if recent_node.id not in dependencies:
                    dependencies.append(recent_node.id)
        
        # Default: link to immediate predecessor if no other dependencies
        if not dependencies and self.recent_nodes:
            dependencies.append(self.recent_nodes[-1].id)
        
        return dependencies
    
    def generate_position(self) -> Position:
        """
        Generate position for graph layout using simple counter-based layout.
        
        Returns:
            Position object with x, y coordinates
        """
        position = Position(x=self.x_position, y=self.y_position)
        
        # Increment x position
        self.x_position += 200
        
        # Alternate y position every 3 nodes
        if self.node_counter % 3 == 0:
            self.y_position += 100
            self.x_position = 0  # Reset x
        
        return position
    
    async def parse_incremental(self, text_chunk: str) -> AsyncGenerator[ThoughtNode, None]:
        """
        Parse thinking text incrementally as chunks arrive.
        
        Args:
            text_chunk: New chunk of thinking text
            
        Yields:
            ThoughtNode objects as they are parsed
        """
        # Accumulate text
        self.accumulated_text += text_chunk
        
        # Try to extract complete segments
        segments = self.split_into_segments(self.accumulated_text)
        
        # If we have complete segments, process them
        if len(segments) > 1:
            # Process all but the last segment (which might be incomplete)
            complete_segments = segments[:-1]
            self.accumulated_text = segments[-1]  # Keep incomplete segment
            
            for segment in complete_segments:
                try:
                    node = self._create_node_from_segment(segment)
                    if node:
                        yield node
                except Exception as e:
                    # Skip problematic segments and continue
                    continue
    
    async def finalize(self) -> AsyncGenerator[ThoughtNode, None]:
        """
        Finalize parsing and process any remaining accumulated text.
        
        Yields:
            Remaining ThoughtNode objects
        """
        if self.accumulated_text.strip():
            # Process remaining text even if below minimum word count
            try:
                node = self._create_node_from_segment(self.accumulated_text)
                if node:
                    yield node
            except Exception:
                pass
    
    def _create_node_from_segment(self, segment: str) -> Optional[ThoughtNode]:
        """
        Create a ThoughtNode from a text segment.
        
        Args:
            segment: Text segment
            
        Returns:
            ThoughtNode or None if creation fails
        """
        if not segment or len(segment.strip()) < 10:
            return None
        
        # Generate node ID
        node_id = self.generate_node_id()
        
        # Classify thought type
        thought_type = self.classify_thought_type(segment)
        
        # Extract keywords
        keywords = extract_keywords(segment)
        
        # Calculate confidence
        confidence = calculate_confidence(segment)
        
        # Generate position
        position = self.generate_position()
        
        # Create node (without dependencies yet)
        node = ThoughtNode(
            id=node_id,
            type=thought_type,
            content=segment.strip(),
            confidence=confidence,
            keywords=keywords,
            dependencies=[],  # Will be filled next
            position=position,
            session_id=self.session_id
        )
        
        # Detect dependencies
        node.dependencies = self.detect_dependencies(node)
        
        # Add to recent nodes (keep last 5)
        self.recent_nodes.append(node)
        if len(self.recent_nodes) > 5:
            self.recent_nodes.pop(0)
        
        return node

