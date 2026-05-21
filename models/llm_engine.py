import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

class LLMEngine:
    def __init__(self, base_model_id="meta-llama/Meta-Llama-3-8B-Instruct", adapter_path="../models/auto-redline-llama3-lora"):
        self.tokenizer = AutoTokenizer.from_pretrained(base_model_id)
        # Load base model
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_id,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        # Load LoRA adapter
        try:
            self.model = PeftModel.from_pretrained(base_model, adapter_path)
            print("Successfully loaded custom LoRA adapter.")
        except Exception as e:
            print(f"Adapter not found. Using base model. Error: {e}")
            self.model = base_model

    def generate_rewrite(self, policy: str, clause: str):
        instruction = f"Analyze the following contract clause. Identify if it violates the company policy. If it does, rewrite it to be compliant and explain why.\n\nPolicy:\n{policy}\n\nClause:\n{clause}"
        prompt = f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{instruction}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
        
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.3,
            do_sample=True,
            pad_token_id=self.tokenizer.eos_token_id
        )
        
        response = self.tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        return response

# Example usage
if __name__ == "__main__":
    engine = LLMEngine()
    result = engine.generate_rewrite(
        policy="Net 30 days.",
        clause="Payment within 90 days."
    )
    print("AI Response:", result)
