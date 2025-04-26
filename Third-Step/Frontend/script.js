function showGradeOptions() {
  const input = document.getElementById('subjectInput').value.trim().toLowerCase();
  const container = document.getElementById('gradeRadioContainer');
  const searchSubjectButtonContainer = document.getElementById('searchSubjectButtonContainer');
  const submitButtonContainer = document.getElementById('submitButtonContainer');

  container.innerHTML = ""; 
  submitButtonContainer.style.display = "none";

  if (input === "math" || input === "functions" || input === "biology" || input === "accounting" || input === "computer science" || input === "religion" || input === "physics") {
    const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    grades.forEach(grade => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="grade" value="${grade}" class="grade-radio"> ${grade}
      `;
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });

    searchSubjectButtonContainer.style.display = "none";
    submitButtonContainer.style.display = "block";

    container.addEventListener('change', (event) => {
      if (event.target.name === "grade") {
        showSubjectsForGrade(input, event.target.value);
      }
    });
  } else {
    container.innerHTML = "No grades available for that subject.";
  }
}

function showSubjectsForGrade(subject, grade) {
  const subjectsContainer = document.getElementById('subjectsContainer');
  const submitButtonContainer = document.getElementById('submitButtonContainer');
  subjectsContainer.innerHTML = "";

  if (grade === "Grade 9" || grade === "Grade 10" || grade === "Grade 12") {
    subjectsContainer.innerHTML = "In process of development, will release later";
    submitButtonContainer.style.display = "none"; // Hide the submit button
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

    subjects.forEach(subject => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" name="mathSubject" value="${subject}" class="subject-checkbox"> ${subject}
      `;
      subjectsContainer.appendChild(label);
      subjectsContainer.appendChild(document.createElement("br"));
    });

    submitButtonContainer.style.display = "block"; // Show the submit button for Grade 11

    subjectsContainer.addEventListener('change', (event) => {
      const checkboxes = subjectsContainer.querySelectorAll('.subject-checkbox');
      const allCheckbox = Array.from(checkboxes).find(cb => cb.value === "All");

      if (event.target.value === "All") {
        const isChecked = event.target.checked;
        checkboxes.forEach(cb => {
          cb.checked = isChecked;
        });
      } else {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked || cb.value === "All");
        allCheckbox.checked = allChecked;
      }
    });
  } else {
    subjectsContainer.innerHTML = "No subjects available for this grade.";
    submitButtonContainer.style.display = "none"; // Hide the submit button if no subjects are available
  }
}

function setupAutocomplete() {
  const inputField = document.getElementById('subjectInput');
  const options = ["math", "biology", "science", "accounting", "computer science", "religion", "history", "geography", "english", "chemistry", "physics", "marketing"];
  const gradeRadioContainer = document.getElementById('gradeRadioContainer');
  const subjectsContainer = document.getElementById('subjectsContainer');
  const submitButtonContainer = document.getElementById('submitButtonContainer');
  const searchSubjectButtonContainer = document.getElementById('searchSubjectButtonContainer');

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

    // Reset grades and subjects if the user starts typing again
    gradeRadioContainer.innerHTML = "";
    subjectsContainer.innerHTML = "";
    submitButtonContainer.style.display = "none";
    searchSubjectButtonContainer.style.display = "block";

    if (query.length >= 3) {
      const filteredOptions = options.filter(option => option.toLowerCase().startsWith(query));

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

function redirectToResultsPage(subject, grade, selectedSubjects) {
  const queryParams = new URLSearchParams({
    subject,
    grade,
    selectedSubjects: selectedSubjects.join(',')
  });
  window.location.href = `results.html?${queryParams.toString()}`;
}

function submitAll() {
  const grade = document.querySelector('input[name="grade"]:checked').value;
  const subject = document.getElementById('subjectInput').value.trim().toLowerCase();
  const selectedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);

  if (grade === "Grade 11" && selectedSubjects.length > 0) {
    redirectToResultsPage(subject, grade, selectedSubjects);
  } else {
    alert("Please select Grade 11 and at least one subject.");
  }
}

document.addEventListener('DOMContentLoaded', setupAutocomplete);