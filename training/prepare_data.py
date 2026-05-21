import json
from datasets import Dataset

def format_instruction(sample):
    """
    Formats a single sample into the Llama 3 prompt structure.
    """
    instruction = f"Analyze the following contract clause. Identify if it violates the company policy. If it does, rewrite it to be compliant and explain why.\n\nPolicy:\n{sample['policy']}\n\nClause:\n{sample['clause']}"
    output = f"Rewritten Clause: {sample['rewritten_clause']}\n\nExplanation: {sample['explanation']}"
    
    return {
        "text": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{instruction}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{output}<|eot_id|>"
    }

def prepare_dataset(json_file_path, output_dir):
    with open(json_file_path, 'r') as f:
        data = json.load(f)
        
    formatted_data = [format_instruction(d) for d in data]
    
    hf_dataset = Dataset.from_list(formatted_data)
    
    # Split into train and eval
    split_dataset = hf_dataset.train_test_split(test_size=0.1)
    
    split_dataset.save_to_disk(output_dir)
    print(f"Dataset prepared and saved to {output_dir}")

if __name__ == "__main__":
    prepare_dataset("../datasets/sample_dataset.json", "../datasets/hf_prepared_data")
