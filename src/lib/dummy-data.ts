export const DUMMY_PRESCRIPTION = {
    "session_id": "string",
    "variant_used": "v1_standard",
    "timings": {
        "total_duration": 68.134037733078,
        "layer_00_total": 7.198059558868408,
        "layer_01_total": 15.56836199760437,
        "layer_02_total": 5.709499359130859,
        "layer_03_total": 39.65807914733887,
        "layer_02_diagnosis_rag": 0,
        "layer_02_medicine_rag": 0
    },
    "chief_complaints": [
        {
            "complaint_name": "Chest pressure",
            "clinical_note": "x 2-3 days, L sided, pressure-like, on exertion, radiating to L arm, with diaphoresis"
        }
    ],
    "history": [
        {
            "history_name": "Type 2 Diabetes Mellitus",
            "clinical_note": "x 8 years"
        }
    ],
    "summary": "Patient presents with a 2-3 day history of left-sided, pressure-like chest pain, exacerbated by exertion. The pain radiates to the left arm and is associated with diaphoresis. Pertinent medical history includes Type 2 Diabetes Mellitus for 8 years.",
    "diagnoses": [
        {
            "diagnosis_name": "Unstable angina",
            "icd_code": "I20.0",
            "confidence": 95,
            "clinical_reasoning": "The patient presents with classic symptoms of acute coronary syndrome: left-sided, pressure-like chest pain, exacerbated by exertion, radiating to the left arm, and associated with diaphoresis. A history of Type 2 Diabetes Mellitus is a significant risk factor. Unstable angina is the most appropriate initial diagnosis within the ACS spectrum given these symptoms, pending definitive cardiac enzyme and ECG findings."
        },
        {
            "diagnosis_name": "Type 2 Diabetes Mellitus",
            "icd_code": "E11.9",
            "confidence": 100,
            "clinical_reasoning": "Patient has a confirmed history of Type 2 Diabetes Mellitus for 8 years, which is a major pre-existing condition and a significant risk factor for cardiovascular disease."
        }
    ],
    "medicines": [
        {
            "generic_name": "Aspirin",
            "trade_name": "Disprin",
            "dosage": "300 mg, chew immediately",
            "routine": {
                "gap_hours": 0,
                "meal_times": []
            },
            "duration": "Single dose now",
            "purpose": "Antiplatelet therapy to prevent further clot formation in coronary arteries."
        },
        {
            "generic_name": "Clopidogrel",
            "trade_name": "Antiplet",
            "dosage": "300 mg, take with water after chewing Aspirin",
            "routine": {
                "gap_hours": 0,
                "meal_times": []
            },
            "duration": "Single loading dose now",
            "purpose": "Antiplatelet therapy in conjunction with Aspirin to reduce the risk of thrombotic events."
        },
        {
            "generic_name": "Glyceryl trinitrate",
            "trade_name": "Angisid",
            "dosage": "0.5 mg, place one tablet under the tongue. May repeat every 5 minutes for up to 3 doses if chest pain persists AND blood pressure remains stable (Systolic BP > 90 mmHg).",
            "routine": {
                "gap_hours": 0,
                "meal_times": []
            },
            "duration": "As needed for chest pain",
            "purpose": "To relieve chest pain by dilating coronary arteries and reducing cardiac workload."
        },
        {
            "generic_name": "Atorvastatin",
            "trade_name": "Tofin",
            "dosage": "80 mg",
            "routine": {
                "gap_hours": 0,
                "meal_times": [
                    "after_dinner"
                ]
            },
            "duration": "Long-term",
            "purpose": "High-intensity statin therapy to stabilize plaque, reduce cholesterol, and improve cardiovascular outcomes in acute coronary syndrome."
        }
    ],
    "investigations": [
        {
            "investigation_name": "Troponin I",
            "reason": "To rule out acute myocardial infarction (NSTEMI) and differentiate it from unstable angina, which is critical for immediate clinical management.",
            "priority": "urgent"
        },
        {
            "investigation_name": "HbA1C",
            "reason": "To assess long-term glycemic control and guide management of Type 2 Diabetes Mellitus, especially in the context of cardiovascular risk.",
            "priority": "routine"
        },
        {
            "investigation_name": "Lipid Profile",
            "reason": "To evaluate cardiovascular risk factors and guide lipid-lowering therapy, which is crucial for secondary prevention in a diabetic patient with suspected acute coronary syndrome.",
            "priority": "routine"
        }
    ],
    "advice": [
        "THIS IS A MEDICAL EMERGENCY. You MUST seek immediate emergency medical attention. Call an ambulance or proceed to the nearest hospital emergency department WITHOUT DELAY.",
        "Do NOT drive yourself to the hospital.",
        "Remain absolutely still and rest completely. Avoid any physical exertion.",
        "Clearly describe your symptoms (chest pain, radiation, diaphoresis, onset, duration, what makes it worse/better) to the emergency medical staff upon arrival.",
        "Inform the medical staff about your medical history of Type 2 Diabetes Mellitus.",
        "You will undergo an Electrocardiogram (ECG) and blood tests (e.g., Troponin levels) promptly at the hospital to confirm the diagnosis.",
        "Be prepared for hospitalization, further investigations (e.g., coronary angiography), and specialized cardiac care under the supervision of a cardiologist.",
        "Continue regular follow-ups for your Type 2 Diabetes. Adhere strictly to your diet and prescribed medications for diabetes.",
        "If you experience recurrence of chest pain, shortness of breath, severe dizziness, fainting, or sudden weakness, seek immediate medical attention again."
    ]
}