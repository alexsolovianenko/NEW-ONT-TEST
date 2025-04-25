function showGradeOptions() {
  const input = document.getElementById('subjectInput').value.trim().toLowerCase();
  const container = document.getElementById('gradeRadioContainer');
  const confirmGrade = document.getElementById('confirmGrade');

  container.innerHTML = ""; 
  confirmGrade.style.display = "none"; 

  if (input === "math" || input === "biology") {
    const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    grades.forEach(grade => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="grade" value="${grade}"> ${grade}
      `;
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });

    confirmGrade.style.display = "block";
  } else {
    container.innerHTML = "No grades available for that subject.";
  }

  if (input === "biology") {
    let subjects = ["All", "Respiratory", "Circulatory", "Genetics", "Evolution", "Digestive"];
    subjects.sort((a, b) => {
      if (a === "All") return -1; 
      if (b === "All") return 1;
      return a.localeCompare(b);
    });
    subjects.forEach(subject => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" name="mathSubject" value="${subject}"> ${subject}
      `;
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  }

  if (input === "accounting") {
    let subjects = ["All", "Accounting Cycle for a Service Business", "Internal and Cash Controls"];
    subjects.sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b); 
    });
    subjects.forEach(subject => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" name="mathSubject" value="${subject}"> ${subject}
      `;
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  }


  if (input === "computer science") {
    let subjects = ["All", "Computer Foundations", "Computing & Programming Basics", "Control Structures", "Functions & Loops"];
    subjects.sort((a, b) => {
      if (a === "All") return -1; 
      if (b === "All") return 1;
      return a.localeCompare(b); 
    });
    subjects.forEach(subject => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" name="mathSubject" value="${subject}"> ${subject}
      `;
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  }
}

function setupAutocomplete() {
  const inputField = document.getElementById('subjectInput');
  const suggestionsContainer = document.getElementById('autocompleteSuggestions');
  const options = ["math", "biology", "science", "accounting", "computer science"];

  inputField.addEventListener('input', () => {
    const query = inputField.value.trim().toLowerCase();
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions

    if (query) {
      const filteredOptions = options.filter(option => option.startsWith(query));
      filteredOptions.forEach(option => {
        const suggestion = document.createElement('div');
        suggestion.textContent = option;
        suggestion.className = 'suggestion-item';
        suggestion.addEventListener('click', () => {
          inputField.value = option; // Set the input field to the selected suggestion
          suggestionsContainer.innerHTML = ""; // Clear suggestions
          showGradeOptions(); // Trigger the grade options logic
        });
        suggestionsContainer.appendChild(suggestion);
      });
    }
  });
}

// Call setupAutocomplete when the page loads
document.addEventListener('DOMContentLoaded', setupAutocomplete);

function submitGrade() {
  const selectedGrade = document.querySelector('input[name="grade"]:checked');
  const selectedSubjects = document.querySelectorAll('input[name="mathSubject"]:checked');
  const result = document.getElementById('result');

  let output = "";

  if (selectedGrade) {
    output += `Grade: ${selectedGrade.value}`;
  } else {
    output += "Please choose a grade.";
  }

  if (selectedSubjects.length > 0) {
    const subjects = Array.from(selectedSubjects).map(subject => subject.value);
    output += `, Subjects: ${subjects.join(", ")}`;
  }

  result.textContent = output;
}


