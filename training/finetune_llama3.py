import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_from_disk
from trl import SFTTrainer

def finetune_model():
    model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
    
    # Load Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Load Model with QLoRA configuration (8-bit or 4-bit)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        load_in_4bit=True, # Requires bitsandbytes
        device_map="auto"
    )
    
    # Prepare model for PEFT
    model = prepare_model_for_kbit_training(model)
    
    # LoRA Config
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "v_proj"]
    )
    model = get_peft_model(model, peft_config)
    
    # Load dataset
    dataset = load_from_disk("../datasets/hf_prepared_data")
    
    # Training Arguments
    training_args = TrainingArguments(
        output_dir="../models/checkpoints",
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=10,
        max_steps=100,
        save_strategy="epoch",
        optim="paged_adamw_8bit",
        fp16=True,
    )
    
    # Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset['train'],
        eval_dataset=dataset['test'],
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args,
    )
    
    print("Starting training...")
    trainer.train()
    
    # Save the final adapter
    model.save_pretrained("../models/auto-redline-llama3-lora")
    tokenizer.save_pretrained("../models/auto-redline-llama3-lora")
    print("Training complete and adapter saved.")

if __name__ == "__main__":
    finetune_model()
