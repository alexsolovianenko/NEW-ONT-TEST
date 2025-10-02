document.getElementById('currentYear').textContent = new Date().getFullYear();


document.addEventListener('DOMContentLoaded', function() {
   const uploadForm = document.getElementById('uploadForm');
   if (!uploadForm) return; // If we're not on the upload page
  
   const fileInput = document.getElementById('fileInput');
   const textInput = document.getElementById('textInput');
   const uploadButton = document.getElementById('uploadButton');
   const fileNameDisplay = document.getElementById('fileName');
   const recentUploadsList = document.getElementById('recentUploadsList');
  
   let selectedFile = null;
   let isUploading = false;
   let recentUploads = [];
  
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
          
           fileNameDisplay.innerHTML = `<i class="ri-file-pdf-line"></i> ${selectedFile.name}`;
       } else {
           selectedFile = null;
           fileNameDisplay.innerHTML = '';
       }
      
       updateButtonState();
   });
  
   document.querySelector('.file-drop-area').addEventListener('click', function() {
       fileInput.click();
   });
  
   uploadForm.addEventListener('submit', function(e) {
       e.preventDefault();
      
       if (!selectedFile || !textInput.value || isUploading) return;
      
       isUploading = true;
       updateButtonState();
      
       uploadButton.innerHTML = '<i class="ri-loader-2-line ri-spin"></i> <span>Uploading...</span>';
      
       setTimeout(function() {
           isUploading = false;
          
           recentUploads.unshift(textInput.value);
           if (recentUploads.length > 5) {
               recentUploads.pop();
           }
           updateRecentUploadsList();
           uploadButton.innerHTML = '<i class="ri-check-line"></i> <span>Upload Complete</span>';
           uploadButton.classList.add('bg-green-600');
           uploadButton.classList.remove('bg-blue-600');
           showToast('Success', `${textInput.value} has been uploaded successfully.`);
           setTimeout(function() {
               uploadForm.reset();
               selectedFile = null;
               fileNameDisplay.innerHTML = '';
               uploadButton.innerHTML = '<i class="ri-upload-2-line"></i> <span>Upload Test</span>';
               uploadButton.classList.remove('bg-green-600');
               uploadButton.classList.add('bg-blue-600');
               updateButtonState();
           }, 3000);
       }, 2000);
   });
  
   textInput.addEventListener('input', updateButtonState);
  
   function updateButtonState() {
       uploadButton.disabled = !selectedFile || !textInput.value || isUploading;
   }
  
   function updateRecentUploadsList() {
       if (recentUploads.length === 0) {
           recentUploadsList.innerHTML = '<div class="no-uploads">No recent uploads. Your uploaded files will appear here.</div>';
           recentUploadsList.classList.add('no-uploads');
       } else {
           recentUploadsList.classList.remove('no-uploads');
           const html = recentUploads.map(upload =>
               `<div class="upload-item"><i class="ri-file-pdf-line"></i>${upload}</div>`
           ).join('');
           recentUploadsList.innerHTML = html;
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