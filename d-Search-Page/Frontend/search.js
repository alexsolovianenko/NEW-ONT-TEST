
document.addEventListener('DOMContentLoaded', function() {
    setupOptionButtons();
    setupSubjectButtons();
    document.getElementById('submitBtn').addEventListener('click', submitAll);
});

// Setup option button functionality
function setupOptionButtons() {
    const searchBySubjectBtn = document.getElementById('searchBySubjectBtn');
    
    searchBySubjectBtn.addEventListener('click', function() {
        showSubjectSelection();
    });
}

// Setup subject button functionality
function setupSubjectButtons() {
    const subjectButtons = document.querySelectorAll('.subject-btn');
    
    subjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            subjectButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            
            const selectedSubject = this.getAttribute('data-subject');
            sessionStorage.setItem('selectedSubject', selectedSubject);
            
            // Show grade options for the selected subject
            showGradeOptions(selectedSubject);
        });
    });
}

function showSubjectSelection() {
    const subjectSelection = document.getElementById('subjectSelection');
    subjectSelection.style.display = 'block';
    
    // Immediate smooth scroll when clicked
    subjectSelection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showGradeOptions(subject) {
    const container = document.getElementById('gradeRadioContainer');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    const subjectsContainer = document.getElementById('subjectsContainer');

    // Clear grade, topics, and hide submit button when a new subject is selected
    container.innerHTML = '';
    subjectsContainer.innerHTML = '';
    subjectsContainer.style.display = 'none';
    submitButtonContainer.style.display = "none";

    // Subject to allowed grades mapping
    const subjectGradeMap = {
        "geography": ["Grade 9"],
        "accounting": ["Grade 11", "Grade 12"],
        "biology": ["Grade 11", "Grade 12"],
        "chemistry": ["Grade 11", "Grade 12"],
        "english": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        "general science": ["Grade 9", "Grade 10"],
        "history": ["Grade 10"],
        "marketing": ["Grade 10", "Grade 11", "Grade 12"],
        "math": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        "functions": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        "physics": ["Grade 11", "Grade 12"],
        "religion": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        "computer science": ["Grade 10", "Grade 11"]
    };
    let grades = subjectGradeMap[subject];
    if (grades) {
        const gradeSection = document.createElement('div');
        gradeSection.className = 'grade-section';
        gradeSection.innerHTML = '<h3>Select Grade Level</h3>';
        const gradeGrid = document.createElement('div');
        gradeGrid.className = 'grade-grid';
        grades.forEach(grade => {
            const gradeBtn = document.createElement('button');
            gradeBtn.className = 'grade-btn';
            gradeBtn.innerHTML = `
                <i class="ri-graduation-cap-line"></i>
                <span>${grade}</span>
            `;
            gradeBtn.addEventListener('click', function() {
                // Remove selected class from all grade buttons
                document.querySelectorAll('.grade-btn').forEach(btn => btn.classList.remove('selected'));
                // Add selected class to clicked button
                this.classList.add('selected');
                // Store the grade and show topics
                sessionStorage.setItem('selectedGrade', grade);
                showSubjects(subject, grade);
            });
            gradeGrid.appendChild(gradeBtn);
        });
        gradeSection.appendChild(gradeGrid);
        container.appendChild(gradeSection);
        container.style.display = "block";
        // Immediate smooth scroll when grade options appear
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        showSubjects(subject, "Grade 11");
    }
}


function showSubjects(subject, grade) {
    sessionStorage.setItem('selectedGrade', grade);
    sessionStorage.setItem('selectedSubject', subject);

    const subjectsContainer = document.getElementById('subjectsContainer');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    
    subjectsContainer.innerHTML = '';
    /*         ************************ ADD AFTER FOR DIFFERENT SUBJECTS*************************************
    if (grade === "Grade 9" || grade === "Grade 10" || grade === "Grade 12") {
        const topicSection = document.createElement('div');
        topicSection.className = 'topic-section';
        topicSection.innerHTML = '<h3>Select Topics</h3><div class="development-notice"><i class="ri-time-line"></i> In process of development, will be released later</div>';
        subjectsContainer.appendChild(topicSection);
        subjectsContainer.style.display = "block";
        
        // Immediate smooth scroll when development notice appears
        subjectsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        submitButtonContainer.style.display = "none";
        return;
    }
    */

    let subjects = [];
    if (subject === "biology" && grade === "Grade 11") {
        subjects = ["All", "Cells", "Respiratory", "Circulatory", "Genetics", "Evolution", "Biodiversity"];
    } else if (subject === "accounting" && grade === "Grade 11") {
        subjects = ["All", "Accounting Cycle for a Service Business", "Internal and Cash Controls", "Business Structures and Accounting Implications", "Ethical Practices in Accounting", "Technology and Financial Statements"];
    
    } else if (subject === "english" && grade === "Grade 9") {
        subjects = ["All", "Romeo & Juliet"]; 
    } else if (subject === "english" && grade === "Grade 10") {
        subjects = ["All", "Macbeth", "The Alchemist", "Advanced Language", "Mythic voices"];
    } else if (subject === "english" && grade === "Grade 11") {
        subjects = ["All", "Rhetoric", "Hamlet", "1984", "Poetry"];

    
    } else if (subject === "computer science" && grade === "Grade 11") {
        subjects = ["All", "Computer Foundations", "Programming Basics", "Functions & Loops", "Lists"];
    } else if (subject === "religion" && grade === "Grade 11") {
        subjects = ["All", "Intro to World Religions", "Indigenous", "Judaism", "Christianity", "Islam", "Hinduism & Buddhism"];
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
        
        const topicSection = document.createElement('div');
        topicSection.className = 'topic-section';
        topicSection.innerHTML = '<h3>Select Topics</h3>';
        
        const topicGrid = document.createElement('div');
        topicGrid.className = 'topic-grid';
        
        let selectedTopics = [];
        
        subjects.forEach(topic => {
            const topicBtn = document.createElement('button');
            topicBtn.className = 'topic-btn';
            topicBtn.innerHTML = `
                <i class="ri-book-line"></i>
                <span>${topic}</span>
            `;
            topicBtn.addEventListener('click', function() {
                if (topic === "All") {
                    // Handle "All" button
                    const isSelected = this.classList.contains('selected');
                    document.querySelectorAll('.topic-btn').forEach(btn => {
                        if (isSelected) {
                            btn.classList.remove('selected');
                        } else {
                            btn.classList.add('selected');
                        }
                    });
                    selectedTopics = isSelected ? [] : [...subjects];
                } else {
                    // Handle individual topic
                    this.classList.toggle('selected');
                    if (this.classList.contains('selected')) {
                        if (!selectedTopics.includes(topic)) {
                            selectedTopics.push(topic);
                        }
                    } else {
                        selectedTopics = selectedTopics.filter(t => t !== topic);
                        // Remove "All" selection if individual item is deselected
                        const allBtn = document.querySelector('.topic-btn');
                        if (allBtn) allBtn.classList.remove('selected');
                    }
                    
                    // Check if all individual items are selected
                    const individualTopics = subjects.filter(s => s !== "All");
                    const allIndividualSelected = individualTopics.every(t => selectedTopics.includes(t));
                    if (allIndividualSelected && !selectedTopics.includes("All")) {
                        selectedTopics.unshift("All");
                        const allBtn = document.querySelector('.topic-btn');
                        if (allBtn) allBtn.classList.add('selected');
                    }
                }
                
                sessionStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
                
                // Show submit button if any topics are selected
                if (selectedTopics.length > 0) {
                    submitButtonContainer.style.display = "block";
                    
                    // Immediate smooth scroll when submit button appears
                    submitButtonContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    submitButtonContainer.style.display = "none";
                }
            });
            topicGrid.appendChild(topicBtn);
        });
        
        topicSection.appendChild(topicGrid);
        subjectsContainer.appendChild(topicSection);
        subjectsContainer.style.display = "block";
        
        // Immediate smooth scroll when topics appear
        subjectsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        const topicSection = document.createElement('div');
        topicSection.className = 'topic-section';
        topicSection.innerHTML = '<h3>Select Topics</h3><div class="no-content">No topics available for this grade and subject.</div>';
        subjectsContainer.appendChild(topicSection);
        subjectsContainer.style.display = "block";
        
        // Immediate smooth scroll when no content message appears
        subjectsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        submitButtonContainer.style.display = "none";
    }
}

function submitAll() {
    const selectedSubject = sessionStorage.getItem('selectedSubject');
    const selectedGrade = sessionStorage.getItem('selectedGrade');
    const selectedTopics = JSON.parse(sessionStorage.getItem('selectedTopics') || '[]');
    
    if (!selectedSubject) {
        alert('Please select a subject first.');
        return;
    }
    
    if (!selectedGrade) {
        alert('Please select a grade.');
        return;
    }
    
    if (selectedTopics.length === 0) {
        alert('Please select at least one topic.');
        return;
    }
    
    // Navigate to the subject page for Grade 11
    if (selectedGrade === "Grade 9" || selectedGrade === "Grade 10" || selectedGrade === "Grade 11" || selectedGrade === "Grade 12") {
        let htmlFile = null;
        
        if (selectedSubject === "biology") {
            htmlFile = "biology.html";
        } else if (selectedSubject === "computer science") {
            htmlFile = "compsci.html";
        } else if (selectedSubject === "accounting") {
            htmlFile = "accounting.html";
        } else if (selectedSubject === "religion") {
            htmlFile = "religion.html";
        } else if (selectedSubject === "physics") {
            htmlFile = "physics.html";
        } else if (selectedSubject === "math" || selectedSubject === "functions") {
            htmlFile = "math.html";
        } else if (selectedSubject === "english") {
            htmlFile = "english.html";
        }
        
        if (htmlFile) {
            window.location.href = "../../e-Subject-Page/Frontend/" + htmlFile;
        } else {
            alert('Subject page not available yet.');
        }
    } else {
        alert('This subject is under development.');
    }
}
