import csv
import random
import uuid
import sys

def generate_dataset(num_rows, output_path):
    print(f"Generating {num_rows} rows to {output_path}...")
    
    legal_domains = ['NDA', 'Employment', 'SaaS', 'Vendor', 'Partnership', 'Lease']
    clause_types = ['Confidentiality', 'Payment Terms', 'Liability', 'Termination', 'Indemnification', 'Governing Law', 'Data Privacy']
    violation_types = ['Excessive Term', 'Missing Notice', 'Uncapped Liability', 'Missing Exclusion', 'Jurisdiction Mismatch', 'Payment Delay', 'Unreasonable SLA']
    risk_levels = ['High', 'Medium', 'Low']
    compliance_statuses = ['Non-Compliant', 'Compliant']

    templates = [
        {
            'clause_type': 'Confidentiality',
            'violation_type': 'Excessive Term',
            'original_clause': 'The Receiving Party shall keep the information confidential for {years} years.',
            'company_policy': 'Confidentiality term must not exceed 3 years.',
            'rewritten_clause': 'The Receiving Party shall keep the information confidential for 3 years.',
            'explanation': 'Reduced the confidentiality term from {years} years to 3 years to comply with company policy.'
        },
        {
            'clause_type': 'Payment Terms',
            'violation_type': 'Payment Delay',
            'original_clause': 'Payment shall be made within {days} days of invoice receipt.',
            'company_policy': 'Standard payment terms are Net 30 days.',
            'rewritten_clause': 'Payment shall be made within 30 days of invoice receipt.',
            'explanation': 'Changed payment terms from {days} days to 30 days to meet Net 30 policy.'
        },
        {
            'clause_type': 'Termination',
            'violation_type': 'Missing Notice',
            'original_clause': 'Either party may terminate this agreement at any time with {notice} days notice.',
            'company_policy': 'Termination requires at least 30 days prior written notice.',
            'rewritten_clause': 'Either party may terminate this agreement at any time with 30 days prior written notice.',
            'explanation': 'Increased termination notice period from {notice} days to 30 days.'
        },
        {
            'clause_type': 'Liability',
            'violation_type': 'Uncapped Liability',
            'original_clause': 'The Provider shall be fully liable for any indirect damages.',
            'company_policy': 'Liability must exclude indirect damages and be capped at fees paid.',
            'rewritten_clause': 'In no event shall the Provider be liable for indirect damages, and total liability shall not exceed fees paid in the prior 12 months.',
            'explanation': 'Added liability cap and excluded indirect damages per risk management guidelines.'
        },
        {
            'clause_type': 'Indemnification',
            'violation_type': 'Missing Exclusion',
            'original_clause': 'Customer indemnifies Provider for all claims, including those due to Provider negligence.',
            'company_policy': 'Indemnification must exclude claims arising from the indemnified party\'s negligence or willful misconduct.',
            'rewritten_clause': 'Customer indemnifies Provider for claims, excluding those arising from Provider\'s negligence or willful misconduct.',
            'explanation': 'Added standard exclusion for Provider\'s own negligence.'
        }
    ]

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'clause_id', 'clause_type', 'original_clause', 'company_policy', 
            'violation_type', 'risk_level', 'rewritten_clause', 'explanation', 
            'compliance_status', 'semantic_similarity', 'legal_domain'
        ])

        for i in range(num_rows):
            domain = random.choice(legal_domains)
            risk = random.choice(risk_levels)
            status = random.choice(compliance_statuses)
            similarity = round(random.uniform(0.7, 0.99), 3)
            
            template = random.choice(templates)
            
            years = random.randint(5, 15)
            days = random.randint(45, 120)
            notice = random.randint(5, 15)
            
            original = template['original_clause'].format(years=years, days=days, notice=notice)
            explanation = template['explanation'].format(years=years, days=days, notice=notice)
            
            if status == 'Compliant':
                original = template['rewritten_clause']
                explanation = "No modifications required."
                violation = "None"
                similarity = 1.0
                risk = "Low"
            else:
                violation = template['violation_type']
            
            row = [
                str(uuid.uuid4()),
                template['clause_type'],
                original,
                template['company_policy'],
                violation,
                risk,
                template['rewritten_clause'],
                explanation,
                status,
                similarity,
                domain
            ]
            
            writer.writerow(row)
            
            if (i + 1) % 100000 == 0:
                print(f"Generated {i + 1} rows...")
                sys.stdout.flush()

    print("Dataset generation complete!")

if __name__ == "__main__":
    generate_dataset(500000, "massive_legal_dataset_part2.csv")
