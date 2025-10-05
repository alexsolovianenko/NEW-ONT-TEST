function getSubjectJsonFile(subject) {
  // Based on the subject, append to proper settings
  subject = subject ? subject.toLowerCase() : "";
  if (["biology", "bio", "biolo"].some(k => subject.includes(k))) {
    return "biology.json";
  } else if (["computer", "comp", "compsci"].some(k => subject.includes(k))) {
    return "compsci.json";
  } else if (["math", "mathematics", "maths"].some(k => subject.includes(k))) {
    return "math.json";
  } else if (["accounting"].some(k => subject.includes(k))) {
    return "accounting.json";
  } else if (["religion"].some(k => subject.includes(k))) {
    return "religion.json";
  } else if (["english", "eng"].some(k => subject.includes(k))) {
    return "english.json";
  } else if (["chemistry", "chem"].some(k => subject.includes(k))) {
    return "chemistry.json";
  } else if (["physics"].some(k => subject.includes(k))) {
    return "physics.json";
  } else if (["marketing", "market"].some(k => subject.includes(k))) {
    return "marketing.json";
  } else if (["geography", "geo"].some(k => subject.includes(k))) {
    return "geography.json";
  }
  return null;
}

function getAvailableTopics(subject, grade) {
  // autocomplete the words
  subject = (subject || "").toLowerCase();
  grade = (grade || "");
  let subjects = ["All"];
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
    const grades = [
      "Grade 9", "Grade 10", "Grade 11", "Grade 12"
    ];
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
            ${availableTopics.map(t => `
              <button type="button" class="filter-btn topic-btn" data-topic="${t}" data-selected="${topics.includes(t)}">
                ${t}
              </button>
            `).join('')}
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
        let newAvailableTopics = getAvailableTopics(subject, newGrade);
        let newTopics = [];
        let showMsg = false;

        // Remove active class from all grade buttons
        gradeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        // *** FIX LATER, Grade 11 only for now
        if (newGrade !== "Grade 11") {
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
      // Disable Apply if not Grade 11
      if (localSelectedGrade !== "Grade 11") {
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
        if (topics.length && !topics.includes("All")) {
          filteredFiles = filteredFiles.filter(f =>
            topics.some(topic =>
              f.name.toLowerCase().includes(topic.toLowerCase())
            )
          );
        }

        const fileList = document.getElementById('file-list');
        if (!fileList) {
          console.error("file-list element not found in the HTML");
          return;
        }

        // Add CSS for half-open file look if not already present
        if (!document.getElementById('half-open-file-css')) {
          const style = document.createElement('style');
          style.id = 'half-open-file-css';
          style.innerHTML = `
            .file-list {
              list-style: none;
              padding: 0;
            }
            .file-list li {
              margin: 12px 0;
            }
            .file-link-container {
              display: inline-block;
              background: #f5f5f5;
              border: 2px solid #d1d1d1;
              border-radius: 8px 40px 8px 8px;
              padding: 12px 32px 12px 20px;
              box-shadow: 2px 4px 8px rgba(0,0,0,0.07);
              position: relative;
              min-width: 220px;
              transition: box-shadow 0.2s, background 0.2s;
              cursor: pointer;
            }
            .file-link-container:hover {
              background: #e9f3ff;
              box-shadow: 4px 8px 16px rgba(0,0,0,0.13);
            }
            .file-link-container::before {
              content: '';
              position: absolute;
              top: -12px;
              left: 0;
              width: 60px;
              height: 18px;
              background: #d1d1d1;
              border-radius: 8px 16px 0 0;
              z-index: 1;
            }
            .file-link {
              text-decoration: none;
              color: #2a3a5a;
              font-weight: 500;
              font-size: 1.08em;
              position: relative;
              z-index: 2;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .file-pdf-icon {
              width: 22px;
              height: 22px;
              display: inline-block;
              background: url('data:image/svg+xml;utf8,<svg fill="none" height="22" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg"><rect fill="%23e53935" height="24" rx="4" width="18" x="3"/><text x="7" y="17" font-size="10" fill="white" font-family="Arial" font-weight="bold">PDF</text></svg>') no-repeat center center;
              background-size: contain;
            }
          `;
          document.head.appendChild(style);
        }

        if (filteredFiles.length === 0) {
          fileList.innerHTML = "<li>No files found for your filters.</li>";
        } else {
          fileList.className = "file-list";
          fileList.innerHTML = filteredFiles.map(f =>
            `<li>
              <div class="file-link-container">
                <a class="file-link" href="${f.url}" target="_self">
                  <span class="file-pdf-icon"></span>
                  ${f.name}
                </a>
              </div>
            </li>`
          ).join('');
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

// retain info
const subject = sessionStorage.getItem('selectedSubject');
const grade = sessionStorage.getItem('selectedGrade');
const topics = JSON.parse(sessionStorage.getItem('selectedTopics') || "[]");

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
          ${
            grade === "Grade 11"
              ? availableTopics.map(t => `
                  <button type="button" class="filter-btn topic-btn" data-topic="${t}" data-selected="${topics.includes(t)}">
                    ${t}
                  </button>
                `).join('')
              : `<span style="color:#b77b00;font-style:italic;">In process of development, will be released later</span>`
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

  // ****FIX LATER. only for gr11
  let localSelectedGrade = grade;
  let localSelectedTopics = [...topics];
  
  if (grade === "Grade 11") {
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

  // 2nd grade button logic 
  gradeButtons.forEach(button => {
    button.onclick = function() {
      const newGrade = this.dataset.grade;
      let newAvailableTopics = getAvailableTopics(subject, newGrade);
      let newTopics = [];
      let showMsg = false;
      
      // Remove active class from all grade buttons
      gradeButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      if (newGrade !== "Grade 11") {
        showMsg = true;
        newAvailableTopics = [];
        newTopics = [];
      } else {
        newTopics = localSelectedTopics.filter(t => newAvailableTopics.includes(t));
        if (newTopics.length === 0) newTopics = ["All"];
      }
      renderFiltersWithMsg(subject, newGrade, newTopics, true, showMsg, origGrade, origTopics);
    };
  });

  // apply and/or Cancel logic
  const applyBtn = document.getElementById('applyFiltersBtn');
  const cancelBtn = document.getElementById('cancelFiltersBtn');
  if (applyBtn) {
    if (grade !== "Grade 11") {
      applyBtn.disabled = true;
      applyBtn.style.opacity = "0.5";
      applyBtn.onclick = function(e) {
        e.preventDefault();
        return false;
      };
    } else {
      applyBtn.onclick = function() {
        // Get selected grade from active button
        const activeGradeBtn = filtersDiv.querySelector('.grade-btn.active');
        let newGrade = activeGradeBtn ? activeGradeBtn.dataset.grade : grade;
        let newTopics = [];
        if (newGrade === "Grade 11") {
          // Get selected topics from active buttons
          const activeTopicBtns = filtersDiv.querySelectorAll('.topic-btn.active');
          newTopics = Array.from(activeTopicBtns).map(btn => btn.dataset.topic);
          if (newTopics.length === 0) newTopics = ["All"];
        }
        sessionStorage.setItem('selectedGrade', newGrade);
        sessionStorage.setItem('selectedTopics', JSON.stringify(newTopics));
        renderFilters(subject, newGrade, newTopics, false);
        loadFiles(subject, newGrade, newTopics);
      };
    }
  }
  if (cancelBtn) {
    cancelBtn.onclick = function(e) {
      // Restore previous UI and state, do not use local state
      e.preventDefault();
      renderFilters(subject, origGrade, origTopics, false);
    };
  }
}