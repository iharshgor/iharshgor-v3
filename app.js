// app.js

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCanvasBackground();
  initTerminal();
  initTabs();
  initProjectsFilter();
  initContactForm();
  initMobileMenu();
  initScrollAnimationsFallback();
});

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

  const getTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    metaColorScheme.content = theme === "dark" ? "dark" : "light";
    localStorage.setItem("theme", theme);
  };

  // Click handler
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = getTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  // Listen for system changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}

/* ==========================================================================
   Interactive Canvas Grid / Particle Background
   ========================================================================== */
function initCanvasBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Responsive canvas resizing
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse interactivity coordinates
  const mouse = { x: null, y: null, radius: 150 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Motion preference check
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class GridDot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.size = 1.5;
    }

    draw() {
      // Fetch dynamic colors based on theme context
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      ctx.fillStyle = isDark ? "rgba(0, 240, 255, 0.15)" : "rgba(92, 60, 242, 0.08)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      if (prefersReducedMotion) return;

      // Displacement logic based on mouse proximity
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Push particles away from mouse
          const dirX = Math.cos(angle) * force * 15;
          const dirY = Math.sin(angle) * force * 15;

          this.x -= dirX;
          this.y -= dirY;
        } else {
          // Return to home position slowly
          if (this.x !== this.baseX) {
            this.x += (this.baseX - this.x) * 0.08;
          }
          if (this.y !== this.baseY) {
            this.y += (this.baseY - this.y) * 0.08;
          }
        }
      } else {
        // Return to home position slowly
        if (this.x !== this.baseX) {
          this.x += (this.baseX - this.x) * 0.08;
        }
        if (this.y !== this.baseY) {
          this.y += (this.baseY - this.y) * 0.08;
        }
      }
    }
  }

  const dots = [];
  const spacing = 35; // Grid spacing density

  function initGrid() {
    dots.length = 0;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        dots.push(new GridDot(x, y));
      }
    }
  }

  initGrid();
  window.addEventListener("resize", initGrid);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      dots[i].draw();
      dots[i].update();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   Interactive Developer Terminal Simulator (Harsh Gor Profile)
   ========================================================================== */
function initTerminal() {
  const termBody = document.querySelector(".terminal-body");
  const termHistory = document.getElementById("terminal-history");
  const termInput = document.getElementById("terminal-input");
  
  if (!termInput) return;

  // Set up command dictionary
  const commands = {
    help: () => `
Available commands:
  <strong class="highlight-text">neofetch</strong>   - Show system diagnostics and banner
  <strong class="highlight-text">about</strong>    - Learn more about Harsh's profile
  <strong class="highlight-text">skills</strong>   - List cloud, programming, and AI competencies
  <strong class="highlight-text">projects</strong> - Show real-world engineering highlights
  <strong class="highlight-text">theme</strong>    - Toggle dark / light color scheme
  <strong class="highlight-text">hired</strong>    - Launch the fast-track hiring script
  <strong class="highlight-text">clear</strong>    - Clear the terminal history
  <strong class="highlight-text">help</strong>     - Show this guide`,

    neofetch: () => `
<div class="neofetch-output">
  <div class="neofetch-info">
    <p><strong class="highlight-text">harsh@cloud-shell</strong></p>
    <p>------------------</p>
    <p><strong class="label">OS:</strong> Linux / AWS / GCP</p>
    <p><strong class="label">Kernel:</strong> Docker / Kubernetes</p>
    <p><strong class="label">Shell:</strong> Bash / GitLab Runner</p>
    <p><strong class="label">Location:</strong> Ahmedabad, India</p>
    <p><strong class="label">Focus:</strong> Cloud (AWS/GCP), DevOps & AI Agents</p>
  </div>
</div>`,
    
    about: () => `
<strong class="highlight-text">Harsh Gor</strong> - Application Developer & DevOps Engineer
-------------------------------------------------------------
- Current: Python Backend Developer at Aviato Consulting (developing AI code migration agents & LiDAR 3D spatial mapping systems).
- Formerly: Sr. Software Engineer at SolGuruz LLP (Python, AWS/GCP DevOps, LLM/MCP integrations).
- Expert in LLM integration, Model Context Protocol (MCP), and autonomous agents.
- Certified Google Associate Cloud Engineer.
- Enthusiast, hungry to learn new technologies, and easily adaptable.`,
    
    skills: () => `
<strong class="highlight-text">Technical Competencies:</strong>
----------------------
- <strong class="logo-accent">DevOps & Cloud:</strong> AWS, GCP, Terraform, Kubernetes (GKE/EKS), Docker, Jenkins, GitLab CI/CD, Route53, VPC, ECS, Cloud Run, S3
- <strong class="logo-accent">AI & Agentic Systems:</strong> LLMs (Gemini/OpenAI integration), Model Context Protocol (MCP), autonomous agents
- <strong class="logo-accent">Backend & Languages:</strong> Python (FastAPI, Django, AWS Lambda), JavaScript, RabbitMQ, PostgreSQL
- <strong class="logo-accent">Frontend & Web:</strong> ReactJS (admin dashboards), HTML5, CSS3, RESTful APIs`,
    
    projects: () => `
<strong class="highlight-text">Real-World Engineering Highlights:</strong>
-----------------------------------
1. <strong class="highlight-text">AWS CodePipeline Automation</strong> - Automated CI/CD pipelines for ECS deployments.
2. <strong class="highlight-text">Digital Signature Engine</strong> - API-driven platform with PFX cert and PDF signing.
3. <strong class="highlight-text">fintech Installment Portal</strong> - Installment portal for consumer microloans and bill pay.
4. <strong class="highlight-text">Vehicle OCR Ingestion</strong> - Asynchronous ML image OCR ingestion pipeline using RabbitMQ.`,
    
    theme: () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) {
        metaColorScheme.content = newTheme === "dark" ? "dark" : "light";
      }
      localStorage.setItem("theme", newTheme);
      return `Theme toggled to <strong class="highlight-text">${newTheme.toUpperCase()}</strong>.`;
    },

    hired: () => {
      // Fast track to contact form
      setTimeout(() => {
        const formName = document.getElementById("form-name");
        const formEmail = document.getElementById("form-email");
        const formMsg = document.getElementById("form-message");
        const contactSec = document.getElementById("contact");
        
        if (formMsg) {
          formMsg.value = "Hey Harsh! I ran your 'hired' terminal script. We'd love to invite you to discuss our upcoming project opportunity. Let's schedule a call!";
          // Trigger floating label update
          formMsg.dispatchEvent(new Event('input'));
        }
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          if (formName) formName.focus();
        }
      }, 1500);
      
      return `
<strong class="highlight-text">*** SECURE DEV-TALK INITIATED ***</strong>
---------------------------------------
- Auto-populating contact form message...
- Redirecting user to contact form...
Ready! Scroll down to the contact section to review and click submit.`;
    },

    clear: () => {
      termHistory.innerHTML = "";
      return null;
    }
  };

  // Auto scroll terminal to bottom
  const scrollTerminal = () => {
    termBody.scrollTop = termBody.scrollHeight;
  };

  // Custom print lines with speed delay
  function printTerminalLine(content, type = "") {
    const line = document.createElement("p");
    line.className = `terminal-line ${type}`;
    line.innerHTML = content;
    termHistory.appendChild(line);
    scrollTerminal();
  }

  // Keyboard events
  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const fullInput = termInput.value.trim();
      termInput.value = "";
      
      if (!fullInput) return;

      const args = fullInput.split(" ");
      const cmd = args[0].toLowerCase();

      // Print prompt echo
      printTerminalLine(`<span class="prompt">harsh@cloud-shell:~$</span> <span class="cmd-run">${fullInput}</span>`);

      // Run commands
      if (commands[cmd]) {
        const output = commands[cmd]();
        if (output !== null) {
          printTerminalLine(output);
        }
      } else {
        printTerminalLine("Shell error: command not found: '" + cmd + "'. Type 'help' for options.", "error-msg");
      }
    }
  });

  // Make terminal window clickable to focus input
  const devTerminal = document.getElementById("dev-terminal");
  devTerminal.addEventListener("click", () => {
    termInput.focus();
  });
}

/* ==========================================================================
   Tabbed Skills Panel Control
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const targetPanelId = tab.getAttribute('aria-controls');

      // Update tabs state
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.removeAttribute('tabindex');

      // Hide all panels, show target
      panels.forEach((panel) => {
        panel.classList.remove('active');
        panel.setAttribute('hidden', 'true');
      });
      const targetPanel = document.getElementById(targetPanelId);
      targetPanel.classList.add('active');
      targetPanel.removeAttribute('hidden');
    });

    // Keyboard Arrow navigation for tablist
    tab.addEventListener('keydown', (e) => {
      const tabList = Array.from(tabs);
      const index = tabList.indexOf(tab);

      let nextIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabList.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabList.length) % tabList.length;
      } else {
        return;
      }

      tabList[nextIndex].focus();
      tabList[nextIndex].click();
      e.preventDefault();
    });
  });
}

/* ==========================================================================
   Projects Grid Filtering
   ========================================================================== */
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle button states
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        
        // Hide / Show transitions using scaling
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 300); // Syncs with transition normal
        }
      });
    });
  });
}

/* ==========================================================================
   Contact Form Validation & Native Dialog Popover
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const dialog = document.getElementById("success-dialog");
  const closeBtn = document.getElementById("close-dialog-btn");

  if (!form || !dialog) return;

  const nameInput = document.getElementById("form-name");
  const emailInput = document.getElementById("form-email");
  const msgInput = document.getElementById("form-message");

  // Input event triggers labels state
  const inputs = [nameInput, emailInput, msgInput];
  inputs.forEach(input => {
    if (!input) return;
    
    // Initial check
    if (input.value) input.classList.add('not-empty');
    
    input.addEventListener('input', () => {
      if (input.value) {
        input.setAttribute('placeholder', ' '); // placeholder hack to satisfy css selector
      }
    });
  });

  // Intercept Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Trigger validation styling states
    nameInput.checkValidity();
    emailInput.checkValidity();
    msgInput.checkValidity();

    if (form.checkValidity()) {
      // Show loading status inside button
      const submitBtn = form.querySelector('.btn-submit');
      const btnText = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.spinner');

      submitBtn.disabled = true;
      btnText.style.opacity = '0.3';
      spinner.removeAttribute('hidden');

      // Send form data to Netlify via AJAX Fetch POST
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
      .then(() => {
        // Reset button loading states
        submitBtn.disabled = false;
        btnText.style.opacity = '1';
        spinner.setAttribute('hidden', 'true');

        // Reset inputs
        form.reset();
        
        // Show Success native modal dialog
        dialog.showModal();
      })
      .catch((error) => {
        console.error("Form submission error:", error);
        // Fallback: reset loader states
        submitBtn.disabled = false;
        btnText.style.opacity = '1';
        spinner.setAttribute('hidden', 'true');
        alert("Oops! There was an issue submitting your form. Please try again.");
      });
    }
  });

  // Close Dialog handler
  closeBtn.addEventListener("click", () => {
    dialog.close();
  });
  
  // Close dialog on clicking overlay background
  dialog.addEventListener("click", (e) => {
    const dialogDimensions = dialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialog.close();
    }
  });
}

/* ==========================================================================
   Mobile Drawer Hamburger Menu
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (!toggleBtn || !mobileNav) return;

  const toggleMenu = () => {
    const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", !isExpanded);
    mobileNav.setAttribute("aria-hidden", isExpanded);
    
    if (!isExpanded) {
      mobileNav.style.display = "block";
      // Tiny delay for visual transition execution
      setTimeout(() => {
        mobileNav.setAttribute("aria-hidden", "false");
      }, 10);
    } else {
      mobileNav.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (toggleBtn.getAttribute("aria-expanded") === "false") {
          mobileNav.style.display = "none";
        }
      }, 300); // Match CSS drawer height transition
    }
  };

  toggleBtn.addEventListener("click", toggleMenu);

  // Close menu drawer on link click
  const drawerLinks = mobileNav.querySelectorAll(".mobile-nav-link");
  drawerLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (toggleBtn.getAttribute("aria-expanded") === "true") {
        toggleMenu();
      }
    });
  });
}

/* ==========================================================================
   Scroll-Driven Animations Fallback
   ========================================================================== */
function initScrollAnimationsFallback() {
  // Check browser support for CSS view-timeline
  const supportsScrollTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!supportsScrollTimeline) {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    // Set initial fallback CSS layout
    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    const observerOptions = {
      root: null, // Viewport
      threshold: 0.15 // Trigger when 15% is visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          // Unobserve once shown to prevent redundant calculations
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      observer.observe(el);
    });
  }
}
