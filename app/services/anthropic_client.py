from anthropic import Anthropic, AsyncAnthropic
from typing import Callable, Optional, Dict, Any
import asyncio
from app.config import settings


class AnthropicService:
    """Service for interacting with Anthropic's Claude API with streaming support."""
    
    def __init__(self):
        """Initialize the Anthropic client with API key from config."""
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-sonnet-4-5-20250929"
        self.thinking_budget_tokens = settings.thinking_budget_tokens
    
    async def analyze_problem(
        self,
        problem_text: str,
        session_id: str,
        on_thinking_chunk: Optional[Callable[[str, str], None]] = None,
        on_token_usage: Optional[Callable[[Dict[str, int]], None]] = None,
        on_error: Optional[Callable[[str], None]] = None,
        on_solution: Optional[Callable[[str], None]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a problem using Claude with extended thinking enabled.
        
        Args:
            problem_text: The problem statement to analyze
            session_id: Unique identifier for this analysis session
            on_thinking_chunk: Callback for thinking text chunks (session_id, text)
            on_token_usage: Callback for token usage updates
            on_error: Callback for error handling
            on_solution: Callback for final solution text
            
        Returns:
            Dictionary containing analysis results and metadata
        """
        try:
            # Accumulate full thinking and solution text
            full_thinking = ""
            full_solution = ""
            thinking_signature = {}
            
            # Create streaming request
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=max(16384, self.thinking_budget_tokens + 8192),
                thinking={
                    "type": "enabled",
                    "budget_tokens": self.thinking_budget_tokens
                },
                messages=[{
                    "role": "user",
                    "content": problem_text
                }]
            ) as stream:
                # Process streaming events
                async for event in stream:
                    try:
                        # Handle content block start - captures thinking signature
                        if event.type == "content_block_start":
                            block = event.content_block
                            if hasattr(block, 'type') and block.type == 'thinking':
                                # Preserve signature fields from thinking block
                                thinking_signature = {
                                    'type': block.type,
                                    'index': event.index
                                }
                        
                        # Handle content block delta - accumulate text
                        elif event.type == "content_block_delta":
                            delta = event.delta
                            if hasattr(delta, 'type'):
                                if delta.type == 'thinking_delta':
                                    # Accumulate thinking text
                                    chunk = delta.thinking
                                    full_thinking += chunk
                                    
                                    # Send chunk to parser in real-time if callback provided
                                    if on_thinking_chunk:
                                        await on_thinking_chunk(session_id, chunk)
                                
                                elif delta.type == 'text_delta':
                                    # Accumulate solution text
                                    chunk = delta.text
                                    full_solution += chunk
                        
                        # Handle content block stop
                        elif event.type == "content_block_stop":
                            pass  # Finalize current block
                        
                        # Handle message delta - track token usage
                        elif event.type == "message_delta":
                            if hasattr(event, 'usage') and event.usage:
                                usage_dict = {
                                    'output_tokens': getattr(event.usage, 'output_tokens', 0)
                                }
                                if on_token_usage:
                                    await on_token_usage(usage_dict)
                    
                    except Exception as chunk_error:
                        # Skip problematic chunks but continue processing
                        error_msg = f"Error processing stream chunk: {str(chunk_error)}"
                        if on_error:
                            await on_error(error_msg)
                        continue
                
                # Get final message for complete token usage
                final_message = await stream.get_final_message()
                
                # Send final solution if callback provided
                if on_solution and full_solution:
                    await on_solution(full_solution)
                
                return {
                    'session_id': session_id,
                    'thinking_text': full_thinking,
                    'solution_text': full_solution,
                    'thinking_signature': thinking_signature,
                    'usage': {
                        'input_tokens': final_message.usage.input_tokens,
                        'output_tokens': final_message.usage.output_tokens,
                    },
                    'model': final_message.model,
                    'stop_reason': final_message.stop_reason
                }
        
        except Exception as e:
            # Handle API errors (rate limits, authentication, network errors)
            error_msg = f"Anthropic API error: {str(e)}"
            if on_error:
                await on_error(error_msg)
            
            # Re-raise for upstream handling
            raise Exception(error_msg) from e

