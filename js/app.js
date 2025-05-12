document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    // Initialize variables
    let systolicImage = null;
    let diastolicImage = null;
    
    // Define specific required field IDs
    const requiredFieldIds = [
        'age',
        'gender',
        'stenosis',
        'hypertension',
        'diabetes',
        'ldl',
        'tgl',  // Triglycerides
        'cho',  // Cholesterol
        'cpr'   // C-reactive protein
    ];
    
    const allInputFields = document.querySelectorAll('input, select');
    
    // Check if all required data is ready
    function checkAnalysisReady() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        // Check if both images are uploaded (required)
        const imagesReady = systolicImage && diastolicImage;
        
        // Check if all required fields are filled
        let requiredFieldsFilled = true;
        requiredFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                // Add visual indication that the field is required
                const label = field.closest('.form-group')?.querySelector('label');
                if (label) {
                label.innerHTML += ' <span class="text-danger">*</span>';
                }
                // Optionally add the HTML5 required attribute
                field.setAttribute('required', '');
            }
            });
        
        // Enable/disable analyze button
        analyzeBtn.disabled = !(imagesReady && requiredFieldsFilled);
        
        // Update form progress
        updateFormProgress();
    }
    
    // Update form completion progress bar
    function updateFormProgress() {
        const formProgress = document.getElementById('formProgress');
        let filledFields = 0;
        
        allInputFields.forEach(field => {
            if (field.value) {
                filledFields++;
            }
        });
        
        const progressPercentage = Math.round((filledFields / requiredFieldIds.length) * 100);
        formProgress.style.width = progressPercentage + '%';
        formProgress.textContent = progressPercentage + '%';
        formProgress.setAttribute('aria-valuenow', progressPercentage);
        
        // Change progress bar color based on completion
        if (progressPercentage < 33) {
            formProgress.className = 'progress-bar bg-danger';
        } else if (progressPercentage < 66) {
            formProgress.className = 'progress-bar bg-warning';
        } else {
            formProgress.className = 'progress-bar bg-success';
        }
    }
    
    // Handle systolic image upload
    document.getElementById('systolicUpload').addEventListener('change', function(e) {
        if (e.target.files.length) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('systolicImage').src = event.target.result;
                document.getElementById('systolicImage').style.display = 'block';
                document.getElementById('cropSystolic').disabled = false;
                systolicImage = event.target.result;
                checkAnalysisReady();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Handle diastolic image upload
    document.getElementById('diastolicUpload').addEventListener('change', function(e) {
        if (e.target.files.length) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('diastolicImage').src = event.target.result;
                document.getElementById('diastolicImage').style.display = 'block';
                document.getElementById('cropDiastolic').disabled = false;
                diastolicImage = event.target.result;
                checkAnalysisReady();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Handle form changes
    document.getElementById('clinicalDataForm').addEventListener('change', checkAnalysisReady);
    
    // Initialize the UI state
    updateFormProgress();
    document.getElementById('resultContainer').style.display = 'none';
    
    // Helper function to get form values with appropriate defaults
    function getFormValue(id, defaultValue = null) {
        const element = document.getElementById(id);
        if (!element) return defaultValue;
        return element.value === "" ? defaultValue : element.value;
    }
    
    // Helper function to get a numerical form value
    function getNumericValue(id, defaultValue = null) {
        const value = getFormValue(id, null);
        return value !== null ? parseFloat(value) : defaultValue;
    }
    
    // Handle analyze button click
    document.getElementById('analyzeBtn').addEventListener('click', function() {
        // Collect all clinical data
        const clinicalData = {
            // Required fields
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            stenosis: parseInt(document.getElementById('stenosis').value),
            
            // Demographics and history
            currentSmoker: parseInt(getFormValue('currentSmoker', 0)),
            oldSmoker: parseInt(getFormValue('oldSmoker', 0)),
            diabetes: parseInt(getFormValue('diabetes', 0)),
            hypertension: parseInt(getFormValue('hypertension', 0)),
            dyslipidemia: parseInt(getFormValue('dyslipidemia', 0)),
            coronary: parseInt(getFormValue('coronary', 0)),
            antidiabetic: parseInt(getFormValue('antidiabetic', 0)),
            antihypertensives: parseInt(getFormValue('antihypertensives', 0)),
            
            // Lab values
            plt: getNumericValue('plt'),
            un: getNumericValue('un'),
            cr: getNumericValue('cr'),
            sgot: getNumericValue('sgot'),
            sgpt: getNumericValue('sgpt'),
            cgt: getNumericValue('cgt'),
            alp: getNumericValue('alp'),
            cho: getNumericValue('cho'),
            tgl: getNumericValue('tgl'),
            hdl: getNumericValue('hdl'),
            ldl: getNumericValue('ldl'),
            glu: getNumericValue('glu'),
            
            // Biomarkers
            cpr: getNumericValue('cpr'),
            fibrinogen: getNumericValue('fibrinogen'),
            mmp1: getNumericValue('mmp1'),
            mmp2: getNumericValue('mmp2'),
            mmp7: getNumericValue('mmp7'),
            mmp9: getNumericValue('mmp9'),
            il1b: getNumericValue('il1b'),
            il6: getNumericValue('il6'),
            tnfa: getNumericValue('tnfa'),
            timp1: getNumericValue('timp1'),
            timp2: getNumericValue('timp2'),
            cpeptide: getNumericValue('cpeptide'),
            insulin: getNumericValue('insulin'),
            rbp4: getNumericValue('rbp4'),
            galectin3: getNumericValue('galectin3')
        };
        
        // Show loading state
        const resultAlert = document.getElementById('resultAlert');
        resultAlert.className = 'alert alert-info';
        resultAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border me-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div>
                    <h5>Analyzing plaque vulnerability...</h5>
                    <p>Processing images and clinical data. Please wait.</p>
                </div>
            </div>
        `;
        document.getElementById('resultContainer').style.display = 'block';
        document.getElementById('resultDetails').style.display = 'none';
        
        // Process images and make prediction
        analyzePlaqueVulnerability(systolicImage, diastolicImage, clinicalData)
            .then(prediction => {
                // Update result progress bar
                const riskProgress = document.getElementById('riskProgress');
                const riskPercentage = (prediction.risk * 100).toFixed(2);
                riskProgress.style.width = riskPercentage + '%';
                
                document.getElementById('riskScore').textContent = `${riskPercentage}% Risk`;
                
                // Set risk level colors
                if (prediction.risk < 0.3) {
                    riskProgress.className = 'progress-bar low-risk';
                } else if (prediction.risk < 0.7) {
                    riskProgress.className = 'progress-bar moderate-risk';
                } else {
                    riskProgress.className = 'progress-bar high-risk';
                }
                
                // Display results
                if (prediction.risk > 0.7) {
                    resultAlert.className = 'alert alert-danger';
                    resultAlert.innerHTML = `
                        <h5><i class="fas fa-exclamation-triangle me-2"></i>High Risk Plaque Detected</h5>
                        <p>This plaque has a high vulnerability score indicating significant risk of rupture.</p>
                    `;
                    
                    // Add key factors
                    const keyFactors = document.getElementById('keyFactors');
                    keyFactors.innerHTML = '';
                    
                    // Add factors based on clinical data
                    addKeyFactors(clinicalData, keyFactors);
                    
                    // Add recommendations
                    const recommendations = document.getElementById('recommendations');
                    recommendations.innerHTML = `
                        <li class="list-group-item list-group-item-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong>Immediate Specialist Consultation:</strong> Refer to a vascular surgeon or interventional radiologist for potential intervention assessment.
                        </li>
                        <li class="list-group-item list-group-item-danger">
                            <i class="fas fa-pills me-2"></i>
                            <strong>Aggressive Medical Therapy:</strong> Consider high-intensity statin therapy and antiplatelet medication.
                        </li>
                        <li class="list-group-item">
                            <i class="fas fa-calendar-check me-2"></i>
                            <strong>Close Monitoring:</strong> Schedule follow-up imaging in 1-3 months.
                        </li>
                    `;
                    
                } else if (prediction.risk > 0.3) {
                    resultAlert.className = 'alert alert-warning';
                    resultAlert.innerHTML = `
                        <h5><i class="fas fa-exclamation-circle me-2"></i>Moderate Risk Plaque Detected</h5>
                        <p>This plaque shows some features of vulnerability that warrant monitoring.</p>
                    `;
                    
                    // Add key factors
                    const keyFactors = document.getElementById('keyFactors');
                    keyFactors.innerHTML = '';
                    
                    // Add factors based on clinical data
                    addKeyFactors(clinicalData, keyFactors);
                    
                    // Add recommendations
                    const recommendations = document.getElementById('recommendations');
                    recommendations.innerHTML = `
                        <li class="list-group-item list-group-item-warning">
                            <i class="fas fa-user-md me-2"></i>
                            <strong>Specialist Consultation:</strong> Consider referral to a vascular specialist.
                        </li>
                        <li class="list-group-item list-group-item-warning">
                            <i class="fas fa-pills me-2"></i>
                            <strong>Medical Therapy:</strong> Optimize statin therapy and antiplatelet medication.
                        </li>
                        <li class="list-group-item">
                            <i class="fas fa-calendar-check me-2"></i>
                            <strong>Regular Monitoring:</strong> Schedule follow-up imaging in 3-6 months.
                        </li>
                    `;
                    
                } else {
                    resultAlert.className = 'alert alert-success';
                    resultAlert.innerHTML = `
                        <h5><i class="fas fa-check-circle me-2"></i>Low Risk Plaque Detected</h5>
                        <p>This plaque appears stable with low vulnerability features.</p>
                    `;
                    
                    // Add key factors
                    const keyFactors = document.getElementById('keyFactors');
                    keyFactors.innerHTML = '';
                    
                    // Add factors based on clinical data
                    addKeyFactors(clinicalData, keyFactors);
                    
                    // Add recommendations
                    const recommendations = document.getElementById('recommendations');
                    recommendations.innerHTML = `
                        <li class="list-group-item list-group-item-success">
                            <i class="fas fa-heart me-2"></i>
                            <strong>Routine Care:</strong> Continue current medical management.
                        </li>
                        <li class="list-group-item">
                            <i class="fas fa-calendar-check me-2"></i>
                            <strong>Periodic Monitoring:</strong> Schedule routine follow-up imaging in 6-12 months.
                        </li>
                        <li class="list-group-item">
                            <i class="fas fa-apple-alt me-2"></i>
                            <strong>Lifestyle Modifications:</strong> Encourage healthy diet, exercise, and smoking cessation if applicable.
                        </li>
                    `;
                }
                
                // Show detailed results
                document.getElementById('resultDetails').style.display = 'block';
            })
            .catch(error => {
                resultAlert.className = 'alert alert-danger';
                resultAlert.innerHTML = `
                    <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
                    <p>An error occurred during analysis: ${error.message}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                `;
                console.error('Analysis error:', error);
                document.getElementById('resultDetails').style.display = 'none';
            });
    });
    
    // Helper function to add key risk factors based on clinical data
    function addKeyFactors(clinicalData, keyFactorsElement) {
        const factors = [];
        
        // Add demographic risk factors
        if (clinicalData.age > 65) {
            factors.push({
                text: 'Advanced age (>65 years)',
                class: clinicalData.age > 75 ? 'list-group-item-danger' : 'list-group-item-warning'
            });
        }
        
        if (clinicalData.gender === 'male') {
            factors.push({
                text: 'Male gender (higher risk profile)',
                class: 'list-group-item-warning'
            });
        }
        
        if (clinicalData.currentSmoker === 1) {
            factors.push({
                text: 'Current smoker',
                class: 'list-group-item-danger'
            });
        } else if (clinicalData.oldSmoker === 1) {
            factors.push({
                text: 'Former smoker',
                class: 'list-group-item-warning'
            });
        }
        
        // Add medical history factors
        if (clinicalData.diabetes === 1) {
            factors.push({
                text: 'Diabetes mellitus',
                class: 'list-group-item-danger'
            });
        }
        
        if (clinicalData.hypertension === 1) {
            factors.push({
                text: 'Hypertension',
                class: 'list-group-item-warning'
            });
        }
        
        if (clinicalData.dyslipidemia === 1) {
            factors.push({
                text: 'Dyslipidemia',
                class: 'list-group-item-warning'
            });
        }
        
        if (clinicalData.coronary === 1) {
            factors.push({
                text: 'Coronary artery disease',
                class: 'list-group-item-danger'
            });
        }
        
        // Add stenosis risk
        if (clinicalData.stenosis > 70) {
            factors.push({
                text: `Severe stenosis (${clinicalData.stenosis}%)`,
                class: 'list-group-item-danger'
            });
        } else if (clinicalData.stenosis > 50) {
            factors.push({
                text: `Moderate stenosis (${clinicalData.stenosis}%)`,
                class: 'list-group-item-warning'
            });
        } else {
            factors.push({
                text: `Mild stenosis (${clinicalData.stenosis}%)`,
                class: 'list-group-item-success'
            });
        }
        
        // Add lab abnormalities if present
        if (clinicalData.ldl !== null && clinicalData.ldl > 130) {
            factors.push({
                text: `Elevated LDL (${clinicalData.ldl} mg/dL)`,
                class: 'list-group-item-warning'
            });
        }
        
        if (clinicalData.hdl !== null && clinicalData.hdl < 40) {
            factors.push({
                text: `Low HDL (${clinicalData.hdl} mg/dL)`,
                class: 'list-group-item-warning'
            });
        }
        
        if (clinicalData.glu !== null && clinicalData.glu > 126) {
            factors.push({
                text: `Elevated glucose (${clinicalData.glu} mg/dL)`,
                class: 'list-group-item-warning'
            });
        }
        
        // Add inflammatory marker abnormalities
        if (clinicalData.cpr !== null && clinicalData.cpr > 3) {
            factors.push({
                text: `Elevated C-reactive protein (${clinicalData.cpr} ng/ml)`,
                class: 'list-group-item-danger'
            });
        }
        
        if (clinicalData.mmp9 !== null && clinicalData.mmp9 > 500) {
            factors.push({
                text: `Elevated MMP-9 (${clinicalData.mmp9} pg/ml)`,
                class: 'list-group-item-danger'
            });
        }
        
        // Add top factors (max 5)
        keyFactorsElement.innerHTML = '';
        const maxFactors = Math.min(5, factors.length);
        
        for (let i = 0; i < maxFactors; i++) {
            keyFactorsElement.innerHTML += `
                <li class="list-group-item ${factors[i].class}">
                    ${factors[i].text}
                </li>
            `;
        }
    }
});