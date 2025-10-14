// Sidebar navigation toggle functionality
(function() {
  function initSidebar() {
    const toggler = document.querySelector('.navbar-toggler');
    const navCollapse = document.getElementById('mainMenu');
    const backdrop = document.getElementById('navBackdrop');
    
    if (!toggler || !navCollapse) {
      console.warn('Sidebar elements not found');
      return;
    }
    
    // Prevent Bootstrap from handling the collapse
    toggler.removeAttribute('data-toggle');
    toggler.removeAttribute('data-target');
    
    // Remove any existing event listeners by cloning the button
    const newToggler = toggler.cloneNode(true);
    toggler.parentNode.replaceChild(newToggler, toggler);
    
    newToggler.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navCollapse.classList.toggle('show');
      if (backdrop) backdrop.classList.toggle('show');
      this.setAttribute('aria-expanded', navCollapse.classList.contains('show'));
    });
    
    if (backdrop) {
      backdrop.addEventListener('click', function() {
        navCollapse.classList.remove('show');
        backdrop.classList.remove('show');
        newToggler.setAttribute('aria-expanded', 'false');
      });
    }

    // Close sidebar when clicking nav links
    document.querySelectorAll('.navbar-collapse .nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navCollapse.classList.remove('show');
        if (backdrop) backdrop.classList.remove('show');
        newToggler.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
