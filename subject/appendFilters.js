function getSubjectJsonFile(subject) {
  // Based on the subject, return the correct path to the JSON file in the subject's folder
  subject = subject ? subject.toLowerCase() : "";
  if (["biology", "bio", "biolo"].some(k => subject.includes(k))) {
    return "/subject/biology/biology.json";
  } else if (["english", "eng"].some(k => subject.includes(k))) {
    return "/subject/english/english.json";
  } else if (["computer science", "computerscience", "comp", "compsci"].some(k => subject.includes(k))) {
    return "/subject/computerscience/compsci.json";
  } else if (["math", "mathematics", "maths"].some(k => subject.includes(k))) {
    return "/subject/math/math.json";
  } else if (["calculus", "calc"].some(k => subject.includes(k))) {
    return "/subject/calculus/calculus.json";
  } else if (["functions", "advanced functions", "adv. functions", "advancedfunctions"].some(k => subject.includes(k))) {
    return "/subject/function/function.json";
  } else if (["religion"].some(k => subject.includes(k))) {
    return "/subject/religion/religion.json";
  } else if (["chemistry", "chem"].some(k => subject.includes(k))) {
    return "/subject/chemistry/chemistry.json";
  } else if (["physics"].some(k => subject.includes(k))) {
    return "/subject/physics/physics.json";
  } else if (["geography", "geo"].some(k => subject.includes(k))) {
    return "/subject/geography/geography.json";
  } else if (["general science", "generalsci", "science"].some(k => subject.includes(k))) {
    return "/subject/generalscience/generalsci.json";
  } else if (["history", "hist"].some(k => subject.includes(k))) {
    return "/subject/history/history.json";
  }
  return null;
}

// Function to preview PDF files in a new tab
function previewPDF(url, filename) {
  // Open PDF in new tab for preview
  const newWindow = window.open(url, '_blank');
  if (!newWindow) {
    alert('Please allow popups to preview the PDF file.');
  }
}

// Function to preview PDF files in a new tab (opens for viewing, not download)
function previewPDF(url, filename) {
  // Use Google's PDF viewer to force display instead of download
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  
  // Open in new window
  const newWindow = window.open(googleViewerUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  
  if (!newWindow) {
    alert('Please allow popups to preview the PDF file.');
  }
}

// Function to download PDF files from S3
function downloadPDF(url, filename) {
  // Show loading state
  const downloadBtn = event.target.closest('.btn-download');
  const originalHTML = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '<i class="ri-loader-4-line"></i> Downloading...';
  downloadBtn.style.pointerEvents = 'none';
  
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      // Restore button state
      downloadBtn.innerHTML = originalHTML;
      downloadBtn.style.pointerEvents = '';
    })
    .catch(err => {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
      
      // Restore button state
      downloadBtn.innerHTML = originalHTML;
      downloadBtn.style.pointerEvents = '';
    });
}

function getAvailableGrades(subject) {
  // Get available grades for each subject - matching search.js logic
  const subjectGradeMap = {
    "geography": ["Grade 9"],
    "biology": ["Grade 11", "Grade 12"],
    "chemistry": ["Grade 11", "Grade 12"],
    "calculus": ["Grade 12"],
    "functions": ["Grade 12"],
    "english": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    "general science": ["Grade 9", "Grade 10"],
    "history": ["Grade 10"],
    "math": ["Grade 9", "Grade 10"],
    "physics": ["Grade 11", "Grade 12"],
    "religion": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    "computer science": ["Grade 10", "Grade 11"]
  };
  return subjectGradeMap[subject ? subject.toLowerCase() : ""] || [];
}

function getAvailableTopics(subject, grade) {
  // autocomplete the words
  subject = (subject || "").toLowerCase();
  grade = (grade || "");
  // Only allow topics for grades that are valid for the subject
  const subjectGradeMap = {
    "geography": ["Grade 9"],
    "biology": ["Grade 11", "Grade 12"],
    "chemistry": ["Grade 11", "Grade 12"],
    "calculus": ["Grade 12"],
    "functions": ["Grade 12"],
    "english": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    "general science": ["Grade 9", "Grade 10"],
    "history": ["Grade 10"],
    "math": ["Grade 9", "Grade 10"],
    "physics": ["Grade 11", "Grade 12"],
    "religion": ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    "computer science": ["Grade 10", "Grade 11"]
  };
  if (!subjectGradeMap[subject] || !subjectGradeMap[subject].includes(grade)) {
    return [];
  }
  let subjects = [];
  if (subject === "biology") {
    if (grade === "Grade 11") {
      subjects = ["All", "Respiratory", "Circulatory", "Genetics", "Evolution", "Digestive"];
    } else if (grade === "Grade 12") {
      subjects = ["All", "Biochemistry", "Metabolic Processes", "Molecular Genetics", "Homeostasis", "Population Dynamics"];
    }
  } else if (subject === "english") {
    if (grade === "Grade 9") {
      subjects = ["All", "TCEA", "Words on Bathroom Walls", "Romeo & Juliet", "The Secret Path", "Short Films discussion"];
    } else if (grade === "Grade 10") {
      subjects = ["All", "Macbeth", "The Alchemist", "Advanced Language", "Mythic voices"];
    } else if (grade === "Grade 11") {
      subjects = ["All", "Rhetoric", "Hamlet", "1984", "Poetry"];
    } else if (grade === "Grade 12") {
      subjects = ["All", "King Lear", "Poetry", "Comparative Essays", "Literary Criticism"];
    }
  } else if (subject === "computer science") {
    if (grade === "Grade 10") {
      subjects = ["All", "Introduction to Programming", "Data Types", "Control Structures", "Functions"];
    } else if (grade === "Grade 11") {
      subjects = ["All", "Computer Foundations", "Computing & Programming Basics", "Control Structures", "Functions & Loops", "Lists", "Emerging Areas of Computer Science"];
    }
  } else if (subject === "religion") {
    if (grade === "Grade 9") {
      subjects = ["All", "Old Testament", "New Testament", "Christian Morality", "Sacraments"];
    } else if (grade === "Grade 10") {
      subjects = ["All", "World Religions", "Christianity", "Judaism", "Islam"];
    } else if (grade === "Grade 11") {
      subjects = ["All", "Into to World Religions", "Indigenous Spirituality", "Judaism", "Christianity", "Islam", "Eastern Religions – Hinduism & Buddhism"];
    } else if (grade === "Grade 12") {
      subjects = ["All", "Philosophy of Religion", "Ethics", "Contemporary Issues"];
    }
  } else if (subject === "physics") {
    if (grade === "Grade 11") {
      subjects = ["All", "Kinematics", "Forces", "Energy and Society", "Waves and Sound", "Electricity and Magnetism"];
    } else if (grade === "Grade 12") {
      subjects = ["All", "Dynamics", "Energy and Momentum", "Gravitation", "Electricity and Magnetism", "Modern Physics"];
    }
  } else if (subject === "math") {
    if (grade === "Grade 9") {
      subjects = ["All", "Number Sense", "Algebra", "Linear Relations", "Measurement", "Geometry"];
    } else if (grade === "Grade 10") {
      subjects = ["All", "Quadratic Relations", "Trigonometry", "Analytic Geometry", "Measurement"];
    }
  } else if (subject === "calculus") {
    if (grade === "Grade 12") {
      subjects = ["All", "Limits", "Derivatives", "Applications of Derivatives", "Integrals", "Applications of Integrals"];
    }
  } else if (subject === "functions") {
    if (grade === "Grade 12") {
      subjects = ["All", "Polynomial Functions", "Rational Functions", "Trigonometry", "Exponential and Log Functions", "Combining Functions", "Rate of Change"];
    }
  } else if (subject === "chemistry") {
    if (grade === "Grade 11") {
      subjects = ["All", "Matter, Chemical Trends, and Bonding", "Chemical Reactions", "Quantities in Chemical Reactions", "Solutions and Solubility", "Gases and Atmospheric Chemistry"];
    } else if (grade === "Grade 12") {
      subjects = ["All", "Organic Chemistry", "Structure and Properties", "Energy Changes", "Chemical Systems and Equilibrium", "Electrochemistry"];
    }
  } else if (subject === "geography") {
    if (grade === "Grade 9") {
      subjects = ["All", "Canadian Geography", "Changing Populations", "Environmental Issues", "Physical Geography", "Liveable Communities"];
    }
  } else if (subject === "general science") {
    if (grade === "Grade 9") {
      subjects = ["All", "Biology", "Chemistry", "Physics", "Earth and Space Science"];
    } else if (grade === "Grade 10") {
      subjects = ["All", "Biology", "Chemistry", "Physics", "Earth and Space Science"];
    }
  } else if (subject === "history") {
    if (grade === "Grade 10") {
      subjects = ["All", "1910-Canada & World War I", "1920-Canada", "1930-Great Depression", "1940-Canada & World War I", "Canada and the Cold War"];
    }
  }
  return subjects;
}


function renderFilters(subject, grade, topics, showForm = false) {
  // change the filters inside the page
  const filtersDiv = document.getElementById('filters');
  if (!showForm) {
    let topicsDisplay = "";
    if (topics && topics.length) {
      if (topics[0].startsWith("All--")) {
        topicsDisplay = topics[0];
      } else {
        topicsDisplay = topics.join(', ');
      }
    }
    filtersDiv.innerHTML = `
      <div><strong>Subject:</strong> ${subject || ''}</div>
      <div><strong>Grade:</strong> ${grade ? grade.replace(/\D/g, '') : ''}</div>
      <div><strong>Topics:</strong> ${topicsDisplay}</div>
      <button id="changeFiltersBtn" style="margin-top:10px;">Change Filters</button>
    `;
    const btn = document.getElementById('changeFiltersBtn');
    if (btn) {
      btn.onclick = function() {
        renderFilters(subject, grade, topics, true);
      };
    }
  } else {
    const grades = getAvailableGrades(subject);
    const availableTopics = getAvailableTopics(subject, grade);

    filtersDiv.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:30px;">
        <div>
          <div style="margin-bottom:12px;"><strong>Select Grade Level</strong></div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${grades.map(g => `
              <button type="button" class="filter-btn grade-btn" data-grade="${g}" data-selected="${g === grade}">
                ${g}
              </button>
            `).join('')}
          </div>
        </div>
        <div>
          <div style="margin-bottom:12px;"><strong>Select Topics</strong></div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${availableTopics.map(t => {
              // Check if this topic is selected - handle both "All" and "All--..." format
              const isSelected = topics.includes(t) || (t === "All" && topics.some(topic => topic.startsWith("All--")));
              return `<button type="button" class="filter-btn topic-btn" data-topic="${t}" data-selected="${isSelected}">
                ${t}
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button id="applyFiltersBtn" class="apply-btn">Apply</button>
        <button id="cancelFiltersBtn" class="cancel-btn">Cancel</button>
      </div>
    `;

    // Apply initial button states
    const gradeButtons = filtersDiv.querySelectorAll('.grade-btn');
    const topicButtons = filtersDiv.querySelectorAll('.topic-btn');
    
    gradeButtons.forEach(btn => {
      if (btn.dataset.selected === 'true') {
        btn.classList.add('active');
      }
    });
    
    topicButtons.forEach(btn => {
      if (btn.dataset.selected === 'true') {
        btn.classList.add('active');
      }
    });

    // Topic button click logic
    let localSelectedGrade = grade;
    let localSelectedTopics = [...topics];

    topicButtons.forEach(button => {
      button.onclick = function() {
        const topicValue = this.dataset.topic;
        const allButton = Array.from(topicButtons).find(btn => btn.dataset.topic === "All");
        const nonAllButtons = Array.from(topicButtons).filter(btn => btn.dataset.topic !== "All");
        
        if (topicValue === "All") {
          if (this.classList.contains('active')) {
            // Deselect all
            topicButtons.forEach(btn => btn.classList.remove('active'));
            localSelectedTopics = [];
          } else {
            // Select all
            topicButtons.forEach(btn => btn.classList.add('active'));
            localSelectedTopics = ["All--" + nonAllButtons.map(btn => btn.dataset.topic).join(", ")];
          }
        } else {
          // Toggle individual topic
          this.classList.toggle('active');
          
          // Update selected topics
          localSelectedTopics = Array.from(topicButtons)
            .filter(btn => btn.classList.contains('active') && btn.dataset.topic !== "All")
            .map(btn => btn.dataset.topic);
          
          // Check if all non-All topics are selected
          const allSelected = nonAllButtons.every(btn => btn.classList.contains('active'));
          if (allSelected && allButton) {
            allButton.classList.add('active');
            localSelectedTopics = ["All--" + nonAllButtons.map(btn => btn.dataset.topic).join(", ")];
          } else if (allButton) {
            allButton.classList.remove('active');
          }
        }
      };
    });

    // Grade button click logic
    gradeButtons.forEach(button => {
      button.onclick = function() {
        const newGrade = this.dataset.grade;
        const availableGrades = getAvailableGrades(subject);
        let newAvailableTopics = getAvailableTopics(subject, newGrade);
        let newTopics = [];
        let showMsg = false;

        // Remove active class from all grade buttons
        gradeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        // Check if the selected grade is available for this subject
        if (!availableGrades.includes(newGrade)) {
          showMsg = true;
          newAvailableTopics = [];
          newTopics = [];
        } else {
          // Keep previously selected topics if still available, otherwise select All
          newTopics = localSelectedTopics.filter(t => newAvailableTopics.includes(t));
          if (newTopics.length === 0) newTopics = ["All"];
        }

        // Update local state only
        localSelectedGrade = newGrade;
        localSelectedTopics = newTopics;

        // Re-render with local state and message if needed
        renderFiltersWithMsg(subject, localSelectedGrade, localSelectedTopics, true, showMsg, grade, topics);
      };
    });

    // Apply and Cancel logic
    const applyBtn = document.getElementById('applyFiltersBtn');
    const cancelBtn = document.getElementById('cancelFiltersBtn');
    if (applyBtn) {
      // Check if the selected grade is available for this subject
      const availableGrades = getAvailableGrades(subject);
      if (!availableGrades.includes(localSelectedGrade)) {
        applyBtn.disabled = true;
        applyBtn.style.opacity = "0.5";
        applyBtn.onclick = function(e) {
          e.preventDefault();
          return false;
        };
      } else {
        applyBtn.onclick = function() {
          // Use local state for apply
          sessionStorage.setItem('selectedGrade', localSelectedGrade);
          sessionStorage.setItem('selectedTopics', JSON.stringify(localSelectedTopics));
          renderFilters(subject, localSelectedGrade, localSelectedTopics, false);
          loadFiles(subject, localSelectedGrade, localSelectedTopics);
          // Dispatch a custom event so subject pages can update their titles instantly
          window.dispatchEvent(new Event('gradeChanged'));
        };
      }
    }
    if (cancelBtn) {
      cancelBtn.onclick = function(e) {
        // Restore previous UI and state, do not use local state
        e.preventDefault();
        renderFilters(subject, grade, topics, false);
      };
    }
  }
}

// Extracted file loading logic for reuse
function loadFiles(subject, grade, topics) {
  const jsonFile = getSubjectJsonFile(subject);
  if (jsonFile) {
    fetch(jsonFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(files => {
        const gradeNum = grade ? grade.replace(/\D/g, '') : null;
        let filteredFiles = files;

        if (gradeNum) {
          filteredFiles = filteredFiles.filter(f => f.name.startsWith(gradeNum + "-"));
        }
        // Check if topics contains "All" or starts with "All--"
        const hasAllFilter = topics.length === 0 || topics.some(t => t === "All" || t.startsWith("All--"));
        if (topics.length && !hasAllFilter) {
          // Get all topics that actually exist in the data
          const allTopicsInData = Array.from(new Set(filteredFiles.map(f => (f.topic || '').toLowerCase())));
          // Get selected topics (case-insensitive)
          const selectedTopics = topics.map(t => t.toLowerCase());
          // If all topics in data are selected (even if some UI topics have no tests), treat as 'All'
          const allSelected = allTopicsInData.every(t => selectedTopics.includes(t));
          if (allSelected) {
            // Show all files (same as 'All')
            // do nothing, filteredFiles already has all files
          } else {
            // Get all topics that actually exist in the data (case-sensitive)
            const allTopicsInData = Array.from(new Set(filteredFiles.map(f => (f.topic || ''))));
            // Get selected topics (skip 'All' and 'All--...')
            const selectedTopics = topics.filter(t => t !== 'All' && !t.startsWith('All--'));
            // If all topics in data are selected, show all files
            const allSelected = allTopicsInData.length > 0 && allTopicsInData.every(t => selectedTopics.includes(t));
            if (allSelected) {
              // Show all files (same as 'All')
              // do nothing, filteredFiles already has all files
            } else {
              filteredFiles = filteredFiles.filter(f => {
                const fileTopic = f.topic || '';
                return selectedTopics.includes(fileTopic);
              });
            }
          }
        }

        const fileList = document.getElementById('file-list');
        if (!fileList) {
          console.error("file-list element not found in the HTML");
          return;
        }

        if (filteredFiles.length === 0) {
          fileList.innerHTML = "<li class='no-tests'>No files found for your filters.</li>";
        } else {
          fileList.className = "file-list";
          fileList.innerHTML = filteredFiles.map(f => {
            const displayName = f.displayName || f.name;
            const topic = f.topic || 'Biology';
            return `<li>
              <div class="test-card">
                <div class="test-header">
                  <div class="test-icon">
                    <i class="ri-file-text-line"></i>
                  </div>
                  <div class="test-title-container">
                    <h3 class="test-title">${displayName}</h3>
                    <div class="test-topic">${topic}</div>
                  </div>
                </div>
                <div class="test-actions">
                  <a href="#" onclick="previewPDF('${f.url}', '${f.name}'); return false;" class="test-btn btn-preview">
                    <i class="ri-eye-line"></i>
                    Preview
                  </a>
                  <a href="${f.url}" download="${f.name}" class="test-btn btn-download">
                    <i class="ri-download-line"></i>
                    Download
                  </a>
                </div>
              </div>
            </li>`;
          }).join('');
        }
      })
      .catch(err => {
        const fileList = document.getElementById('file-list');
        if (fileList) {
          fileList.innerHTML = `<li>Error loading files: ${err.message}. Check if the JSON file exists and is valid.</li>`;
        } else {
          console.error("file-list element not found.");
        }
      });
  } else {
    const fileList = document.getElementById('file-list');
    if (fileList) {
      fileList.innerHTML = "<li>No subject selected or subject not recognized.</li>";
    }
  }
}

// retain info: prefer sessionStorage but infer from URL when missing
let subject = sessionStorage.getItem('selectedSubject');
let grade = sessionStorage.getItem('selectedGrade');
let topics = JSON.parse(sessionStorage.getItem('selectedTopics') || "[]");

// If subject isn't set in sessionStorage (user opened a subject page directly),
// try to infer the subject from the URL path: /subject/chemistry/
if (!subject && typeof window !== 'undefined' && window.location && window.location.pathname) {
  const m = window.location.pathname.match(/\/subject\/([^\/]+)\/?/i);
  if (m && m[1]) {
    const urlName = m[1].toLowerCase();
    // map some folder names to the readable subject strings used elsewhere
    const urlToSubjectMap = {
      'computerscience': 'computer science',
      'generalscience': 'general science',
      'function': 'functions'
    };
    subject = urlToSubjectMap[urlName] || urlName.replace(/[-_]/g, ' ');
    // store for consistency so other scripts can rely on sessionStorage
    try {
      sessionStorage.setItem('selectedSubject', subject);
    } catch (e) {
      // ignore if storage is not available
    }
  }
}

// If grade/topics aren't set, set defaults based on available grades for the subject
if (subject && (!grade || topics.length === 0)) {
  const availableGrades = getAvailableGrades(subject);
  if (availableGrades.length > 0 && !grade) {
    grade = availableGrades[0]; // Use first available grade
    try {
      sessionStorage.setItem('selectedGrade', grade);
    } catch (e) {}
  }
  if (topics.length === 0) {
    topics = ["All"];
    try {
      sessionStorage.setItem('selectedTopics', JSON.stringify(topics));
    } catch (e) {}
  }
}

// show filters
renderFilters(subject, grade, topics, false);

// load files 
loadFiles(subject, grade, topics);

console.log({ subject, grade, topics });

// if not gr 11
function renderFiltersWithMsg(subject, grade, topics, showForm, showMsg, origGrade, origTopics) {
  const filtersDiv = document.getElementById('filters');
  const grades = [
    "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];
  const availableTopics = getAvailableTopics(subject, grade);

  filtersDiv.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:30px;">
      <div>
        <div style="margin-bottom:12px;"><strong>Select Grade Level</strong></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${getAvailableGrades(subject).map(g => `
            <button type="button" class="filter-btn grade-btn" data-grade="${g}" data-selected="${g === grade}">
              ${g}
            </button>
          `).join('')}
        </div>
      </div>
      <div>
        <div style="margin-bottom:12px;"><strong>Select Topics</strong></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${
            availableTopics.length > 0
              ? availableTopics.map(t => {
                  // Check if this topic is selected - handle both "All" and "All--..." format
                  const isSelected = topics.includes(t) || (t === "All" && topics.some(topic => topic.startsWith("All--")));
                  return `<button type="button" class="filter-btn topic-btn" data-topic="${t}" data-selected="${isSelected}">
                    ${t}
                  </button>`;
                }).join('')
              : `<span style=\"color:#b77b00;font-style:italic;\">No topics available for this grade</span>`
          }
        </div>
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-top:20px;">
      <button id="applyFiltersBtn" class="apply-btn">Apply</button>
      <button id="cancelFiltersBtn" class="cancel-btn">Cancel</button>
    </div>
  `;

  // Apply initial button states
  const gradeButtons = filtersDiv.querySelectorAll('.grade-btn');
  const topicButtons = filtersDiv.querySelectorAll('.topic-btn');
  
  gradeButtons.forEach(btn => {
    if (btn.dataset.selected === 'true') {
      btn.classList.add('active');
    }
  });
  
  topicButtons.forEach(btn => {
    if (btn.dataset.selected === 'true') {
      btn.classList.add('active');
    }
  });

  // Enable topic selection for all grades with topics
  let localSelectedGrade = grade;
  let localSelectedTopics = [...topics];
  if (availableTopics.length > 0) {
    topicButtons.forEach(button => {
      button.onclick = function() {
        const topicValue = this.dataset.topic;
        const allButton = Array.from(topicButtons).find(btn => btn.dataset.topic === "All");
        const nonAllButtons = Array.from(topicButtons).filter(btn => btn.dataset.topic !== "All");
        if (topicValue === "All") {
          if (this.classList.contains('active')) {
            // Deselect all
            topicButtons.forEach(btn => btn.classList.remove('active'));
            localSelectedTopics = [];
          } else {
            // Select all
            topicButtons.forEach(btn => btn.classList.add('active'));
            localSelectedTopics = ["All--" + nonAllButtons.map(btn => btn.dataset.topic).join(", ")];
          }
        } else {
          // Toggle individual topic
          this.classList.toggle('active');
          // Update selected topics
          localSelectedTopics = Array.from(topicButtons)
            .filter(btn => btn.classList.contains('active') && btn.dataset.topic !== "All")
            .map(btn => btn.dataset.topic);
          // Check if all non-All topics are selected
          const allSelected = nonAllButtons.every(btn => btn.classList.contains('active'));
          if (allSelected && allButton) {
            allButton.classList.add('active');
            localSelectedTopics = ["All--" + nonAllButtons.map(btn => btn.dataset.topic).join(", ")];
          } else if (allButton) {
            allButton.classList.remove('active');
          }
        }
      };
    });
  }

  // Grade button logic for all grades
  gradeButtons.forEach(button => {
    button.onclick = function() {
      const newGrade = this.dataset.grade;
      let newAvailableTopics = getAvailableTopics(subject, newGrade);
      let newTopics = [];
      // Remove active class from all grade buttons
      gradeButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      newTopics = localSelectedTopics.filter(t => newAvailableTopics.includes(t));
      if (newTopics.length === 0) newTopics = ["All"];
      renderFilters(subject, newGrade, newTopics, true);
    };
  });

  // apply and/or Cancel logic
  const applyBtn = document.getElementById('applyFiltersBtn');
  const cancelBtn = document.getElementById('cancelFiltersBtn');
  if (applyBtn) {
    applyBtn.onclick = function() {
      // Get selected grade from active button
      const activeGradeBtn = filtersDiv.querySelector('.grade-btn.active');
      let newGrade = activeGradeBtn ? activeGradeBtn.dataset.grade : grade;
      let newTopics = [];
      // Get selected topics from active buttons
      const activeTopicBtns = filtersDiv.querySelectorAll('.topic-btn.active');
      newTopics = Array.from(activeTopicBtns).map(btn => btn.dataset.topic);
      if (newTopics.length === 0) newTopics = ["All"];
      sessionStorage.setItem('selectedGrade', newGrade);
      sessionStorage.setItem('selectedTopics', JSON.stringify(newTopics));
      renderFilters(subject, newGrade, newTopics, false);
      loadFiles(subject, newGrade, newTopics);
      // Dispatch a custom event so subject pages can update their titles instantly
      window.dispatchEvent(new Event('gradeChanged'));
    };
  }
  if (cancelBtn) {
    cancelBtn.onclick = function(e) {
      // Restore previous UI and state, do not use local state
      e.preventDefault();
      renderFilters(subject, origGrade, origTopics, false);
    };
  }
}