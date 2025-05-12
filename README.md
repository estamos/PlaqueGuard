# Carotid Plaque Vulnerability Assessment Tool (CDSS)

This project implements a web-based prototype Clinical Decision Support System (CDSS) for the identification and risk stratification of carotid atherosclerotic plaques. Developed in the context of a multimodal research framework, it combines B-mode ultrasound imaging (systolic and diastolic phases) with detailed clinical, laboratory, and biomarker data to assess the vulnerability of carotid plaques. Inference is performed in-browser using a TensorFlow.js model, allowing for real-time prediction without transmitting any patient data to a server.

---

## 🚀 Features

- Upload systolic and diastolic ultrasound images.
- Input structured clinical data:
  - Demographics (age, gender, smoking status)
  - Medical history (diabetes, hypertension, dyslipidemia, coronary artery disease)
  - Lab results (LDL, HDL, glucose, cholesterol, etc.)
  - Biomarkers (CRP, MMPs, ILs, TNFα, etc.)
- Image and clinical data are preprocessed and passed through a multimodal deep learning model.
- Predicts risk score [0–1] for plaque vulnerability.
- Displays a color-coded risk level: Low, Moderate, or High.
- Highlights key contributing factors and provides personalized clinical recommendations.
- Designed for integration with:
  - ESVS 2023 Clinical Practice Guidelines on Atherosclerotic Carotid and Vertebral Artery Disease *(see Supplementary Table \ref{tab:esc_recommendations})*
  - AHA Atherosclerotic Plaque Classification *(see Supplementary Table \ref{tab:aha_plaque})*

---

## 🧠 Model Architecture

- **Image Processing**: EfficientNet or similar CNN for systolic and diastolic image inputs.
- **Clinical Data Processing**: Dense layers for tabular inputs.
- **Fusion**: Concatenation of image and tabular features followed by dense layers.
- **Output**: Scalar value ∈ [0, 1] indicating risk of plaque rupture.

---

## 📁 File Overview

- `index.html`: User interface for uploading data and displaying results.
- `app.js`: Handles form logic, image loading, and UI interactivity.
- `tf-model.js`: Loads the model and performs prediction.
- `model/`: Place your converted TensorFlow.js model files (`model.json` and binary weight shards).

---

## 🛠️ Getting Started

1. Convert your trained model to TensorFlow.js format:
   ```bash
   tensorflowjs_converter --input_format=tf_saved_model path/to/saved_model path/to/model
Place the converted model in the /model/ directory.

Open index.html in a modern web browser (no backend/server required).

Upload ultrasound images and clinical data to receive a vulnerability risk assessment.

## 📌 Notes
This tool is in the Alpha phase and is for research use only.

It is not approved for clinical diagnosis or therapeutic decision-making.

Predictions must be interpreted in the context of full clinical evaluation.

No patient data is stored or transmitted; all inference occurs client-side.

## 👨‍⚕️ Intended Users
- Vascular surgeons

- Neurologists

- Interventional radiologists

- Cardiovascular researchers

- Graduate students working on atherosclerosis, medical imaging, or clinical AI

## 📄 License
This code is intended for academic, non-commercial research use only. Please contact the author for collaboration or licensing inquiries.

## ✍️ Citation
If you use this tool or its concepts in your research or publication, please cite the following:

Evangelos Stamos, Deep multimodal fusion of image and non-image data in identification of high-risk carotid atheromatous plaque, National Technical University of Athens, 2025.

BibTeX:

``
@mastersthesis{stamos2025cdss,
  author = {Evangelos Stamos},
  title = {Deep multimodal fusion of image and non-image data in identification of high-risk carotid atheromatous plaque},
  school = {National Technical University of Athens},
  year = {2025}
}
``