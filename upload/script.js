document.addEventListener('DOMContentLoaded', function() {
   const uploadForm = document.getElementById('uploadForm');
   if (!uploadForm) return; // If we're not on the upload page
  
   const fileInput = document.getElementById('fileInput');
   const textInput = document.getElementById('textInput');
   const uploadButton = document.getElementById('uploadButton');
   const fileNameDisplay = document.getElementById('fileName');
  
   if (!fileInput) {
       console.error('File input not found!');
       return;
   }
  
   let selectedFile = null;
   let isUploading = false;
  
   updateButtonState();
  
   fileInput.addEventListener('change', function(e) {
       if (e.target.files && e.target.files.length > 0) {
           selectedFile = e.target.files[0];
          
           if (selectedFile.type !== 'application/pdf') {
               showToast('Error', 'Only PDF files are allowed.');
               selectedFile = null;
               fileInput.value = '';
               fileNameDisplay.innerHTML = '';
               updateButtonState();
               return;
           }
          
           if (selectedFile.size > 10 * 1024 * 1024) {
               showToast('Error', 'File size exceeds 10MB limit.');
               selectedFile = null;
               fileInput.value = '';
               fileNameDisplay.innerHTML = '';
               updateButtonState();
               return;
           }
          
           // Display selected file with animation
           fileNameDisplay.innerHTML = `<i class="ri-file-pdf-line"></i> ${selectedFile.name}`;
           fileNameDisplay.classList.add('show');
           
           // Show success message
           showToast('Success', `File "${selectedFile.name}" selected successfully!`);
       } else {
           selectedFile = null;
           fileNameDisplay.innerHTML = '';
           fileNameDisplay.classList.remove('show');
       }
      
       updateButtonState();
   });
  
   // Text input change handler for real-time button updates
   textInput.addEventListener('input', function() {
       updateButtonState();
   });

   // File drop area click handler - simplified
   const fileDropArea = document.querySelector('.file-drop-area');
   if (fileDropArea && fileInput) {
       fileDropArea.style.cursor = 'pointer';
       fileDropArea.addEventListener('click', function(e) {
           fileInput.click();
       });
   }
  
   uploadForm.addEventListener('submit', async function(e) {
       e.preventDefault();
      
       if (!selectedFile || !textInput.value || isUploading) return;
      
       isUploading = true;
       updateButtonState();
      
       uploadButton.innerHTML = '<i class="ri-loader-2-line ri-spin"></i> <span>Uploading...</span>';
      
       try {
           const formData = new FormData();
           formData.append('file', selectedFile);
           formData.append('text', textInput.value);
           
           const response = await fetch('/upload', {
               method: 'POST',
               body: formData
           });
           
           if (response.ok) {
               const result = await response.json();
               uploadButton.innerHTML = '<i class="ri-check-line"></i> <span>Upload Complete</span>';
               uploadButton.classList.add('bg-green-600');
               uploadButton.classList.remove('bg-blue-600');
               showToast('Success', `${textInput.value} has been uploaded successfully.`);
               
               setTimeout(function() {
                   uploadForm.reset();
                   selectedFile = null;
                   fileNameDisplay.innerHTML = '';
                   fileNameDisplay.classList.remove('show');
                   uploadButton.innerHTML = '<i class="ri-upload-2-line"></i> <span>Upload Test</span>';
                   uploadButton.classList.remove('bg-green-600');
                   uploadButton.classList.add('bg-blue-600');
                   isUploading = false;
                   updateButtonState();
               }, 3000);
           } else {
               throw new Error('Upload failed');
           }
       } catch (error) {
           console.error('Upload error:', error);
           showToast('Error', 'Upload failed. Please try again.');
           uploadButton.innerHTML = '<i class="ri-upload-2-line"></i> <span>Upload Test</span>';
           isUploading = false;
           updateButtonState();
       }
   });
  
   textInput.addEventListener('input', updateButtonState);
  
   function updateButtonState() {
       const isReady = selectedFile && textInput.value && !isUploading;
       uploadButton.disabled = !isReady;
       
       // Add visual feedback for button state
       if (isReady) {
           uploadButton.classList.add('ready');
           uploadButton.innerHTML = '<i class="ri-upload-cloud-line"></i> Upload File';
       } else {
           uploadButton.classList.remove('ready');
           if (!selectedFile) {
               uploadButton.innerHTML = '<i class="ri-file-add-line"></i> Select a file first';
           } else if (!textInput.value) {
               uploadButton.innerHTML = '<i class="ri-edit-line"></i> Enter test name';
           } else {
               uploadButton.innerHTML = '<i class="ri-upload-cloud-line"></i> Upload File';
           }
       }
   }
  
   function showToast(title, message) {
       const toast = document.createElement('div');
       toast.className = 'toast ' + (title === 'Error' ? 'toast-error' : 'toast-success');
       toast.innerHTML = `
           <div class="toast-header">
               <i class="ri-${title === 'Error' ? 'error-warning' : 'check'}-line"></i>
               <strong>${title}</strong>
           </div>
           <div class="toast-body">${message}</div>
       `;
       document.body.appendChild(toast);
      
       setTimeout(() => {
           toast.classList.add('show');
           setTimeout(() => {
               toast.classList.remove('show');
               setTimeout(() => {
                   document.body.removeChild(toast);
               }, 300);
           }, 3000);
       }, 100);
   }
  
   const style = document.createElement('style');
   style.textContent = `
       .toast {
           position: fixed;
           bottom: 20px;
           right: 20px;
           min-width: 250px;
           padding: 15px;
           background-color: white;
           border-radius: 8px;
           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
           transform: translateY(100px);
           opacity: 0;
           transition: all 0.3s ease;
           z-index: 1000;
       }
      
       .toast.show {
           transform: translateY(0);
           opacity: 1;
       }
      
       .toast-header {
           display: flex;
           align-items: center;
           margin-bottom: 5px;
       }
      
       .toast-header i {
           margin-right: 8px;
       }
      
       .toast-success .toast-header {
           color: #2ecc71;
       }
      
       .toast-error .toast-header {
           color: #e74c3c;
       }
      
       .toast-body {
           color: #2c3e50;
       }
   `;
   document.head.appendChild(style);
});