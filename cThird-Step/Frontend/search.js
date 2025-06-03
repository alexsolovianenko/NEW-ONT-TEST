document.addEventListener('DOMContentLoaded', function() {
    setupAutocomplete();
    document.getElementById('searchSubjectBtn').addEventListener('click', showGradeOptions);
    document.getElementById('submitBtn').addEventListener('click', submitAll);
});

const subjectOptions = [
    "math", "biology", "science", "accounting", 
    "computer science", "religion", "history", 
    "geography", "english", "chemistry", "physics", "marketing"
];

function showGradeOptions() {
    const input = document.getElementById('subjectInput').value.trim().toLowerCase();
    sessionStorage.setItem('selectedSubject', input);

    const container = document.getElementById('gradeRadioContainer');
    const searchSubjectButtonContainer = document.getElementById('searchSubjectButtonContainer');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    
    container.innerHTML = '<h3 class="form-label">Select Grade Level</h3>'; 
    submitButtonContainer.style.display = "none";
    
    if (["math", "functions", "biology", "accounting", "computer science", "religion", "physics"].includes(input)) {
        const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-group';
        
        grades.forEach(grade => {
            const label = document.createElement("label");
            label.className = 'radio-label';
            label.innerHTML = `
                <input type="radio" name="grade" value="${grade}" class="grade-radio"> ${grade}
            `;
            label.querySelector('input').addEventListener('change', function() {
                sessionStorage.setItem('selectedGrade', grade);
            });
            radioGroup.appendChild(label);
        });
        
        container.appendChild(radioGroup);
        
        container.addEventListener('change', (event) => {
            if (event.target.name === "grade") {
                showSubjectsForGrade(input, event.target.value);
            }
        });
    } else {
        container.innerHTML = '<h3 class="form-label">Select Grade Level</h3>';
        container.innerHTML += '<div class="no-content">No grades available for that subject.</div>';
    }
}

function showSubjectsForGrade(subject, grade) {
    sessionStorage.setItem('selectedGrade', grade);
    sessionStorage.setItem('selectedSubject', subject);

    const subjectsContainer = document.getElementById('subjectsContainer');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    
    subjectsContainer.innerHTML = '<h3 class="form-label">Select Topics</h3>';
    
    if (grade === "Grade 9" || grade === "Grade 10" || grade === "Grade 12") {
        subjectsContainer.innerHTML += '<div class="development-notice"><i class="ri-time-line"></i> In process of development, will be released later</div>';
        submitButtonContainer.style.display = "none";
        return;
    }
    
    let subjects = [];
    if (subject === "biology" && grade === "Grade 11") {
        subjects = ["All", "Respiratory", "Circulatory", "Genetics", "Evolution", "Digestive"];
    } else if (subject === "accounting" && grade === "Grade 11") {
        subjects = ["All", "Accounting Cycle for a Service Business", "Internal and Cash Controls", "Business Structures and Accounting Implications", "Ethical Practices in Accounting", "Technology and Financial Statements"];
    } else if (subject === "computer science" && grade === "Grade 11") {
        subjects = ["All", "Computer Foundations", "Computing & Programming Basics", "Control Structures", "Functions & Loops", "Lists", "Emerging Areas of Computer Science"];
    } else if (subject === "religion" && grade === "Grade 11") {
        subjects = ["All", "Into to World Religions", "Indigenous Spirituality", "Judaism", "Christianity", "Islam", "Eastern Religions – Hinduism & Buddhism"];
    } else if (subject === "physics" && grade === "Grade 11") {
        subjects = ["All", "Kinematics", "Forces", "Energy and Society", "Waves and Sound", "Electricity and Magnetism"];
    } else if (subject === "math" || subject === "functions") {
        if (grade === "Grade 11") {
            subjects = ["All", "Algebra", "Trigonometry", "Calculus", "Statistics"];
        }
    }
    
    if (subjects.length > 0) {
        subjects.sort((a, b) => {
            if (a === "All") return -1;
            if (b === "All") return 1;
            return a.localeCompare(b);
        });
        
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        
        subjects.forEach(topic => {
            const label = document.createElement("label");
            label.className = 'checkbox-label';
            label.innerHTML = `
                <input type="checkbox" name="topic" value="${topic}" class="subject-checkbox"> ${topic}
            `;
            label.querySelector('input').addEventListener('change', function() {
                const selectedTopics = Array.from(subjectsContainer.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);
                sessionStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
            });
            checkboxGroup.appendChild(label);
        });
        
        subjectsContainer.appendChild(checkboxGroup);
        submitButtonContainer.style.display = "block";
        
        subjectsContainer.addEventListener('change', (event) => {
            const checkboxes = subjectsContainer.querySelectorAll('.subject-checkbox');
            const allCheckbox = Array.from(checkboxes).find(cb => cb.value === "All");
            
            if (event.target.value === "All") {
                const isChecked = event.target.checked;
                checkboxes.forEach(cb => {
                    cb.checked = isChecked;
                });
            } else {
                const allIndividualChecked = Array.from(checkboxes)
                    .filter(cb => cb.value !== "All")
                    .every(cb => cb.checked);
                    
                if (allCheckbox) {
                    allCheckbox.checked = allIndividualChecked;
                }
            }
        });
    } else {
        subjectsContainer.innerHTML += '<div class="no-content">No topics available for this grade and subject.</div>';
        submitButtonContainer.style.display = "none";
    }
}

function setupAutocomplete() {
    const inputField = document.getElementById('subjectInput');
    const gradeRadioContainer = document.getElementById('gradeRadioContainer');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    
    let currentSuggestion = "";
    let isDeleting = false;
    
    inputField.addEventListener('input', () => {
        if (isDeleting) {
            currentSuggestion = "";
            return;
        }
        
        const query = inputField.value.trim().toLowerCase();
        const cursorPosition = inputField.selectionStart;
        currentSuggestion = "";
        
        gradeRadioContainer.innerHTML = "";
        subjectsContainer.innerHTML = "";
        submitButtonContainer.style.display = "none";
        
        if (query.length >= 3) {
            const filteredOptions = subjectOptions.filter(option => 
                option.toLowerCase().startsWith(query)
            );
            
            if (filteredOptions.length > 0) {
                currentSuggestion = filteredOptions[0];
                inputField.value = query + currentSuggestion.slice(query.length);
                inputField.setSelectionRange(cursorPosition, inputField.value.length);
            }
        }
    });
    
    inputField.addEventListener('keydown', (event) => {
        if (event.key === "Tab" && currentSuggestion) {
            event.preventDefault();
            inputField.value = currentSuggestion;
            inputField.setSelectionRange(inputField.value.length, inputField.value.length);
            currentSuggestion = "";
        } else if (event.key === "Enter") {
            event.preventDefault();
            currentSuggestion = "";
            showGradeOptions();
        } else if (event.key === "Backspace") {
            isDeleting = true;
        }
    });
    
    inputField.addEventListener('keyup', (event) => {
        if (event.key === "Backspace") {
            isDeleting = false;
        }
    });
}

function submitAll() {
    const selectedGrade = document.querySelector('input[name="grade"]:checked');
    if (!selectedGrade) {
        showToast('Error', 'Please select a grade level.');
        return;
    }
    const grade = selectedGrade.value;
    const subject = document.getElementById('subjectInput').value.trim().toLowerCase();
    const selectedTopics = Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);

    sessionStorage.setItem('selectedSubject', subject);
    sessionStorage.setItem('selectedGrade', grade);
    sessionStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));

    let htmlFile = null;
    if (["biology", "bio", "biolo"].some(k => subject.includes(k))) {
        htmlFile = "biology.html";
    } else if (["computer", "comp", "compsci"].some(k => subject.includes(k))) {
        htmlFile = "compsci.html";
    } else if (["accounting"].some(k => subject.includes(k))) {
        htmlFile = "accounting.html";
    } else if (["religion"].some(k => subject.includes(k))) {
        htmlFile = "religion.html";
    } else if (["english", "eng"].some(k => subject.includes(k))) {
        htmlFile = "english.html";
    } else if (["chemistry", "chem"].some(k => subject.includes(k))) {
        htmlFile = "chemistry.html";
    } else if (["physics"].some(k => subject.includes(k))) {
        htmlFile = "physics.html";
    } else if (["marketing", "market"].some(k => subject.includes(k))) {
        htmlFile = "marketing.html";
    } else if (["geography", "geo"].some(k => subject.includes(k))) {
        htmlFile = "geography.html";
    }

    if (grade === "Grade 11" && selectedTopics.length > 0 && htmlFile) {
        window.location.href = "../../dFourth-Step/Frontend/" + htmlFile;
    } else {
        showToast('Error', 'Please select Grade 11 and at least one topic.');
    }
}

function displayResults(subject, grade, selectedTopics) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTitle = document.getElementById('resultsTitle');
    const testResults = document.getElementById('testResults');
    
    testResults.innerHTML = '';
    
    resultsTitle.textContent = `${grade} ${subject.charAt(0).toUpperCase() + subject.slice(1)} Tests`;
    
    if (selectedTopics.includes('All')) {
        const allTopics = Array.from(document.querySelectorAll('.subject-checkbox'))
            .filter(cb => cb.value !== 'All')
            .map(cb => cb.value);
            
        generateTestResults(testResults, subject, grade, allTopics);
    } else {
        generateTestResults(testResults, subject, grade, selectedTopics);
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function generateTestResults(container, subject, grade, topics) {
    if (topics.length === 0) {
        container.innerHTML = '<div class="no-content">No tests found for the selected criteria.</div>';
        return;
    }
    
    topics.forEach(topic => {
        const testCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 1; i <= testCount; i++) {
            const resultItem = document.createElement('div');
            resultItem.className = 'test-result-item';
            
            resultItem.innerHTML = `
                <div class="test-result-header">
                    <i class="ri-file-pdf-line"></i>
                    <span>${grade} ${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${topic} Test ${i}</span>
                </div>
                <div class="test-result-meta">
                    <span><i class="ri-calendar-line"></i> April 2025</span>
                    <span><i class="ri-time-line"></i> 75 minutes</span>
                </div>
                <div class="test-result-actions">
                    <button class="btn-outline">
                        <i class="ri-download-line"></i> Download
                    </button>
                    <button class="btn-outline">
                        <i class="ri-eye-line"></i> Preview
                    </button>
                </div>
            `;
            
            container.appendChild(resultItem);
        }
    });
}
