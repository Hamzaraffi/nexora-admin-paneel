// Nexora Admin Dashboard JavaScript
const API = "http://localhost:5000/api";
let quillEditor = null;
let currentEditId = null;
let currentEditType = null;

// Auth check
const token = localStorage.getItem("nexora_admin_token");
if (!token) window.location.href = "index.html";

// API helper
async function apiCall(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers };
  try {
    const res = await fetch(`${API}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("nexora_admin_token");
        window.location.href = "index.html";
      }
      throw new Error(data.message || "Request failed");
    }
    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

// Toast
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Toggle collapsible sections
function toggleSection(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('.toggle-icon');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '−';
  } else {
    content.style.display = 'none';
    icon.textContent = '+';
  }
}

// Handle image upload
let uploadedImages = [];
function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  const preview = document.getElementById('image-preview');
  
  files.forEach(file => {
    if (uploadedImages.length >= 4) {
      showToast('Maximum 4 images allowed', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.push(e.target.result);
      const img = document.createElement('div');
      img.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1;';
      img.innerHTML = `
        <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" />
        <button type="button" onclick="removeImage(${uploadedImages.length - 1})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
      `;
      preview.appendChild(img);
      document.getElementById('blog-images-data').value = JSON.stringify(uploadedImages);
    };
    reader.readAsDataURL(file);
  });
}

function removeImage(index) {
  uploadedImages.splice(index, 1);
  const preview = document.getElementById('image-preview');
  preview.innerHTML = '';
  uploadedImages.forEach((img, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1;';
    div.innerHTML = `
      <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" />
      <button type="button" onclick="removeImage(${i})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
    `;
    preview.appendChild(div);
  });
  document.getElementById('blog-images-data').value = JSON.stringify(uploadedImages);
}

// Case Study specific functions
let caseLogoData = null;
let caseScreenshots = [];
let techTags = [];
let metrics = [];
let deliverables = [];

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      caseLogoData = e.target.result;
      document.getElementById('logo-filename').textContent = file.name;
      document.getElementById('case-logo-data').value = caseLogoData;
    };
    reader.readAsDataURL(file);
  }
}

function handleScreenshotsUpload(event) {
  const files = Array.from(event.target.files);
  const preview = document.getElementById('screenshots-preview');
  
  files.forEach(file => {
    if (caseScreenshots.length >= 10) {
      showToast('Maximum 10 screenshots allowed', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      caseScreenshots.push(e.target.result);
      const img = document.createElement('div');
      img.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9;';
      img.innerHTML = `
        <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" />
        <button type="button" onclick="removeScreenshot(${caseScreenshots.length - 1})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
      `;
      preview.appendChild(img);
      document.getElementById('case-screenshots-data').value = JSON.stringify(caseScreenshots);
    };
    reader.readAsDataURL(file);
  });
}

function removeScreenshot(index) {
  caseScreenshots.splice(index, 1);
  const preview = document.getElementById('screenshots-preview');
  preview.innerHTML = '';
  caseScreenshots.forEach((img, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9;';
    div.innerHTML = `
      <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" />
      <button type="button" onclick="removeScreenshot(${i})" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
    `;
    preview.appendChild(div);
  });
  document.getElementById('case-screenshots-data').value = JSON.stringify(caseScreenshots);
}

function initTechTags() {
  techTags = [];
  const input = document.getElementById('tech-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim();
      if (value && !techTags.includes(value)) {
        techTags.push(value);
        renderTechTags();
        input.value = '';
      }
    }
  });
}

function renderTechTags() {
  const container = document.getElementById('tech-tags');
  container.innerHTML = techTags.map((tag, i) => `
    <span class="tag">${tag} <button type="button" onclick="removeTechTag(${i})" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 4px;">×</button></span>
  `).join('');
}

function removeTechTag(index) {
  techTags.splice(index, 1);
  renderTechTags();
}

function addMetric() {
  const container = document.getElementById('metrics-container');
  const index = metrics.length;
  metrics.push({ label: '', value: '' });
  const div = document.createElement('div');
  div.className = 'metric-item';
  div.innerHTML = `
    <input type="text" placeholder="Metric label (e.g., Traffic Increase)" onchange="updateMetric(${index}, 'label', this.value)" />
    <input type="text" placeholder="Value (e.g., +150%)" onchange="updateMetric(${index}, 'value', this.value)" />
    <button type="button" class="btn btn-sm btn-danger" onclick="removeMetric(${index})">×</button>
  `;
  container.appendChild(div);
}

function updateMetric(index, field, value) {
  metrics[index][field] = value;
}

function removeMetric(index) {
  metrics.splice(index, 1);
  const container = document.getElementById('metrics-container');
  container.innerHTML = '';
  metrics.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'metric-item';
    div.innerHTML = `
      <input type="text" placeholder="Metric label" value="${m.label}" onchange="updateMetric(${i}, 'label', this.value)" />
      <input type="text" placeholder="Value" value="${m.value}" onchange="updateMetric(${i}, 'value', this.value)" />
      <button type="button" class="btn btn-sm btn-danger" onclick="removeMetric(${i})">×</button>
    `;
    container.appendChild(div);
  });
}

function addDeliverable() {
  const container = document.getElementById('deliverables-container');
  const index = deliverables.length;
  deliverables.push('');
  const div = document.createElement('div');
  div.className = 'deliverable-item';
  div.innerHTML = `
    <input type="text" placeholder="Deliverable (e.g., Custom CRM System)" onchange="updateDeliverable(${index}, this.value)" />
    <button type="button" class="btn btn-sm btn-danger" onclick="removeDeliverable(${index})">×</button>
  `;
  container.appendChild(div);
}

function updateDeliverable(index, value) {
  deliverables[index] = value;
}

function removeDeliverable(index) {
  deliverables.splice(index, 1);
  const container = document.getElementById('deliverables-container');
  container.innerHTML = '';
  deliverables.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'deliverable-item';
    div.innerHTML = `
      <input type="text" placeholder="Deliverable" value="${d}" onchange="updateDeliverable(${i}, this.value)" />
      <button type="button" class="btn btn-sm btn-danger" onclick="removeDeliverable(${i})">×</button>
    `;
    container.appendChild(div);
  });
}

function updateCharCount(input, countId, max) {
  const count = input.value.length;
  document.getElementById(countId).textContent = count;
  if (count > max) {
    document.getElementById(countId).style.color = 'var(--danger)';
  } else {
    document.getElementById(countId).style.color = 'var(--text-secondary)';
  }
}

// Modal
function openModal(title, content) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = content;
  document.getElementById("modal-overlay").classList.add("show");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("show");
  currentEditId = null;
  currentEditType = null;
  if (quillEditor) quillEditor = null;
}

// Navigation
function switchView(viewName) {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add("active");
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(`view-${viewName}`)?.classList.add("active");
  const titles = { 
    overview: "Dashboard", 
    blogs: "Blogs", 
    cases: "Case Studies", 
    testimonials: "Client Reviews", 
    portfolio: "Stats & Numbers", 
    contacts: "Leads & Enquiries", 
    settings: "Scripts & Tracking",
    community: "Community Hub",
    logos: "Client Logos",
    team: "Team Members",
    users: "Admin Users"
  };
  document.getElementById("topbar-title").textContent = titles[viewName] || viewName;
  loadViewData(viewName);
}

async function loadViewData(viewName) {
  switch (viewName) {
    case "overview": await loadOverview(); break;
    case "blogs": await loadBlogs(); break;
    case "cases": await loadCases(); break;
    case "testimonials": await loadTestimonials(); break;
    case "portfolio": await loadPortfolio(); break;
    case "contacts": await loadContacts(); break;
    case "settings": await loadSettings(); break;
    case "team": await loadTeam(); break;
    case "community": showToast("Community Hub - Coming soon!", "warning"); break;
    case "logos": showToast("Client Logos - Coming soon!", "warning"); break;
    case "users": showToast("Admin Users - Coming soon!", "warning"); break;
  }
}

// Overview
async function loadOverview() {
  try {
    const [blogs, cases, testimonials, contacts, portfolio] = await Promise.all([
      apiCall("/blogs"), apiCall("/cases"), apiCall("/testimonials?all=true"), apiCall("/contacts"), apiCall("/portfolio")
    ]);
    
    // Modern stats cards
    document.getElementById("stats-grid").innerHTML = `
      <div class="stat-card-modern">
        <div class="stat-icon" style="background: rgba(77, 147, 255, 0.2);">📬</div>
        <div class="stat-number">${contacts.data.length}</div>
        <div class="stat-label">Total Leads</div>
        <div class="stat-meta">${contacts.data.filter(c => !c.read_status).length} new</div>
      </div>
      <div class="stat-card-modern">
        <div class="stat-icon" style="background: rgba(99, 102, 241, 0.2);">💼</div>
        <div class="stat-number">${cases.data.filter(c => c.published).length}</div>
        <div class="stat-label">Case Studies</div>
        <div class="stat-meta">Published</div>
      </div>
      <div class="stat-card-modern">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.2);">📝</div>
        <div class="stat-number">${blogs.data.length}</div>
        <div class="stat-label">Blog Posts</div>
        <div class="stat-meta">All types</div>
      </div>
      <div class="stat-card-modern">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.2);">👥</div>
        <div class="stat-number">1</div>
        <div class="stat-label">Team Members</div>
        <div class="stat-meta">Active</div>
      </div>
    `;
    
    // Recent leads with modern design
    const recentContacts = contacts.data.slice(0, 5);
    const contactsContainer = document.getElementById("recent-contacts-modern");
    
    if (recentContacts.length === 0) {
      contactsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📬</div>
          <div class="empty-title">No leads yet</div>
          <div class="empty-subtitle">Share your website to start receiving leads</div>
        </div>
      `;
    } else {
      contactsContainer.innerHTML = recentContacts.map(c => `
        <div class="lead-item">
          <div class="lead-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div class="lead-info">
            <div class="lead-name">${c.name}</div>
            <div class="lead-email">${c.email}</div>
          </div>
          <div class="lead-time">${new Date(c.created_at).toLocaleDateString()}</div>
        </div>
      `).join("");
    }
    
    // Update unread badge
    const unread = contacts.data.filter(c => !c.read_status).length;
    const badge = document.getElementById("unread-badge");
    if (unread > 0) { badge.textContent = unread; badge.style.display = "inline-block"; } else { badge.style.display = "none"; }
  } catch (err) { showToast("Failed to load overview", "error"); }
}

// Blogs
async function loadBlogs() {
  try {
    const { data } = await apiCall("/blogs");
    const tbody = document.getElementById("blogs-tbody");
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--text-secondary)">No blogs yet. Create your first article!</td></tr>'; return; }
    tbody.innerHTML = data.map(blog => `<tr><td><strong>${blog.title}</strong></td><td>${blog.category || "—"}</td><td><span class="status-badge ${blog.published ? "status-published" : "status-draft"}">${blog.published ? "Published" : "Draft"}</span></td><td>${new Date(blog.created_at).toLocaleDateString()}</td><td><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editBlog('${blog.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteBlog('${blog.id}')">Delete</button></div></td></tr>`).join("");
  } catch (err) { showToast("Failed to load blogs", "error"); }
}

function newBlog() {
  currentEditType = "blog"; currentEditId = null;
  openModal("New Blog Post", `
    <form class="modal-form" onsubmit="saveBlog(event)">
      <div class="form-group">
        <label>Images <span style="color: var(--text-secondary); font-weight: 400;">Up to 4 — 0/4 added</span></label>
        <input type="file" id="blog-images" accept="image/*" multiple style="display: none;" onchange="handleImageUpload(event)" />
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('blog-images').click()">Choose Files</button>
        <div id="image-preview" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;"></div>
        <input type="hidden" name="images" id="blog-images-data" />
      </div>
      
      <div class="form-group">
        <label>Title *</label>
        <input type="text" name="title" placeholder="Enter an engaging title..." required />
      </div>
      
      <div class="form-group">
        <label>Subtitle *</label>
        <input type="text" name="subtitle" placeholder="Add a compelling subtitle..." required />
      </div>
      
      <div class="form-group">
        <label>Category *</label>
        <select name="category" required>
          <option value="">Select a category</option>
          <option value="Technology">Technology</option>
          <option value="Marketing">Marketing</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
          <option value="SEO">SEO</option>
          <option value="Development">Development</option>
          <option value="Social Media">Social Media</option>
          <option value="Content Strategy">Content Strategy</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Content *</label>
        <div id="editor-container"></div>
        <div style="text-align: right; margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
          <span id="char-count">0 characters</span>
        </div>
      </div>
      
      <div class="form-group collapsible-section">
        <div class="section-header" onclick="toggleSection(this)">
          <label style="margin: 0; cursor: pointer;">SEO & Metadata</label>
          <span class="section-subtitle">Slug, author, tags, publish date.</span>
          <span class="toggle-icon">+</span>
        </div>
        <div class="section-content" style="display: none; margin-top: 16px;">
          <div class="form-group">
            <label>SEO Title</label>
            <input type="text" name="seo_title" placeholder="Optimized title for search engines" />
          </div>
          <div class="form-group">
            <label>SEO Description</label>
            <textarea name="seo_desc" rows="2" placeholder="Meta description for search results"></textarea>
          </div>
          <div class="form-group">
            <label>Slug (URL)</label>
            <input type="text" name="slug" placeholder="blog-post-url-slug" />
          </div>
          <div class="form-group">
            <label>Author</label>
            <input type="text" name="author" placeholder="Author name" />
          </div>
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" name="tags" placeholder="marketing, seo, growth" />
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="published" checked />
          Publish immediately
        </label>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-secondary">Save & Close</button>
        <button type="submit" class="btn btn-primary">Publish Blog Post</button>
      </div>
      
      <div style="text-align: center; margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary);">
        Your changes save automatically — closing won't lose your work.
      </div>
    </form>
  `);
  
  quillEditor = new Quill("#editor-container", { 
    theme: "snow", 
    placeholder: "Write your blog content. Use the link button to add hyperlinks — great for internal linking and SEO.",
    modules: { 
      toolbar: [
        ["bold", "italic", { header: [1, 2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "code-block"],
        ["blockquote"],
        [{ align: [] }],
        ["clean"]
      ] 
    } 
  });
  
  // Character counter
  quillEditor.on('text-change', function() {
    const text = quillEditor.getText();
    document.getElementById('char-count').textContent = `${text.length} characters`;
  });
}

async function editBlog(id) {
  try {
    const { data } = await apiCall(`/blogs/${id}`);
    currentEditType = "blog"; currentEditId = id;
    openModal("Edit Blog Article", `<form class="modal-form" onsubmit="saveBlog(event)"><div class="form-group"><label>Title *</label><input type="text" name="title" value="${data.title}" required /></div><div class="form-group"><label>Category</label><input type="text" name="category" value="${data.category || ""}" /></div><div class="form-group"><label>Excerpt</label><textarea name="excerpt" rows="2">${data.excerpt || ""}</textarea></div><div class="form-group"><label>Content</label><div id="editor-container"></div></div><div class="form-group"><label>SEO Title</label><input type="text" name="seo_title" value="${data.seo_title || ""}" /></div><div class="form-group"><label>SEO Description</label><textarea name="seo_desc" rows="2">${data.seo_desc || ""}</textarea></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="published" ${data.published ? "checked" : ""} />Published</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update Blog</button></div></form>`);
    quillEditor = new Quill("#editor-container", { theme: "snow", modules: { toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline", "strike"], ["blockquote", "code-block"], [{ list: "ordered" }, { list: "bullet" }], ["link", "image"], ["clean"]] } });
    if (data.content_html) quillEditor.root.innerHTML = data.content_html;
  } catch (err) { showToast("Failed to load blog", "error"); }
}

async function saveBlog(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const payload = { 
    title: formData.get("title"), 
    category: formData.get("category"),
    excerpt: formData.get("subtitle") || "", // Use subtitle as excerpt
    content_html: quillEditor.root.innerHTML, 
    seo_title: formData.get("seo_title") || formData.get("title"), 
    seo_desc: formData.get("seo_desc") || formData.get("subtitle") || "", 
    published: formData.get("published") ? 1 : 0,
    // Additional fields
    images: formData.get("images") || "[]",
    slug: formData.get("slug") || "",
    author: formData.get("author") || "",
    tags: formData.get("tags") || ""
  };
  
  try {
    if (currentEditId) { 
      await apiCall(`/blogs/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) }); 
      showToast("Blog updated successfully!"); 
    } else { 
      await apiCall("/blogs", { method: "POST", body: JSON.stringify(payload) }); 
      showToast("Blog created successfully!"); 
    }
    closeModal(); 
    loadBlogs();
    uploadedImages = []; // Reset images
  } catch (err) { 
    showToast(err.message || "Failed to save blog", "error"); 
  }
}

async function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;
  try { await apiCall(`/blogs/${id}`, { method: "DELETE" }); showToast("Blog deleted successfully!"); loadBlogs(); }
  catch (err) { showToast("Failed to delete blog", "error"); }
}

// Cases
async function loadCases() {
  try {
    const { data } = await apiCall("/cases");
    const tbody = document.getElementById("cases-tbody");
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--text-secondary)">No case studies yet. Add your first success story!</td></tr>'; return; }
    tbody.innerHTML = data.map(cs => `<tr><td><strong>${cs.title}</strong></td><td>${cs.client || "—"}</td><td>${cs.industry || "—"}</td><td><span class="status-badge ${cs.published ? "status-published" : "status-draft"}">${cs.published ? "Published" : "Draft"}</span></td><td><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editCase('${cs.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteCase('${cs.id}')">Delete</button></div></td></tr>`).join("");
  } catch (err) { showToast("Failed to load case studies", "error"); }
}

function newCase() {
  currentEditType = "case"; currentEditId = null;
  openModal("Add New Case Study", `
    <form class="modal-form" onsubmit="saveCase(event)" style="max-height: 70vh; overflow-y: auto;">
      
      <!-- BASIC INFO -->
      <div class="form-section">
        <h3 class="section-title">BASIC INFO</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" name="title" required />
          </div>
          <div class="form-group">
            <label>Client Name *</label>
            <input type="text" name="client" required />
          </div>
        </div>
        
        <div class="form-group">
          <label>Client Logo</label>
          <input type="file" id="case-logo" accept="image/*" style="display: none;" onchange="handleLogoUpload(event)" />
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('case-logo').click()">Choose File</button>
          <span id="logo-filename" style="margin-left: 12px; color: var(--text-secondary);">No file chosen</span>
          <input type="hidden" name="logo" id="case-logo-data" />
        </div>
        
        <div class="form-group">
          <label>Project Type <span style="color: var(--text-secondary); font-weight: 400;">(select all that apply)</span></label>
          <div class="checkbox-grid">
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Development" /> Development</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Marketing" /> Marketing</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="AI" /> AI</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Bpo" /> Bpo</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="App" /> App</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Ecommerce" /> Ecommerce</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Healthcare" /> Healthcare</label>
            <label class="checkbox-item"><input type="checkbox" name="project_type" value="Other" /> Other</label>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Industry</label>
            <input type="text" name="industry" />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" name="location" />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="Live">Live</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="form-group">
            <label>Website URL</label>
            <input type="url" name="website_url" placeholder="https://" />
          </div>
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" name="featured" class="toggle-switch" />
            Featured
          </label>
        </div>
      </div>
      
      <!-- STORY -->
      <div class="form-section">
        <h3 class="section-title">STORY</h3>
        
        <div class="form-group">
          <label>Challenge</label>
          <div id="challenge-editor"></div>
          <div class="editor-hint">What problem did the client have? Use the link button to cite sources or related work.</div>
        </div>
        
        <div class="form-group">
          <label>Solution</label>
          <div id="solution-editor"></div>
          <div class="editor-hint">What did Nexora build/deliver?</div>
        </div>
        
        <div class="form-group">
          <label>Results</label>
          <div id="results-editor"></div>
          <div class="editor-hint">What was the outcome? Numbers, quotes, before/after comparisons all welcome.</div>
        </div>
        
        <div class="editor-note">Use the toolbar to format text and add hyperlinks. Content is stored as markdown.</div>
      </div>
      
      <!-- METRICS -->
      <div class="form-section">
        <h3 class="section-title">METRICS</h3>
        <div id="metrics-container"></div>
        <button type="button" class="btn-link" onclick="addMetric()">+ Add Metric</button>
      </div>
      
      <!-- DELIVERABLES -->
      <div class="form-section">
        <h3 class="section-title">DELIVERABLES</h3>
        <div id="deliverables-container"></div>
        <button type="button" class="btn-link" onclick="addDeliverable()">+ Add Deliverable</button>
      </div>
      
      <!-- TECHNOLOGIES -->
      <div class="form-section">
        <h3 class="section-title">TECHNOLOGIES</h3>
        <div class="form-group">
          <input type="text" name="technologies" id="tech-input" placeholder="Type a technology and press Enter (e.g. React, Node.js, MongoDB)" />
          <div id="tech-tags" class="tags-container"></div>
        </div>
      </div>
      
      <!-- MEDIA -->
      <div class="form-section">
        <h3 class="section-title">MEDIA</h3>
        
        <div class="form-group">
          <label>Screenshots <span style="color: var(--text-secondary); font-weight: 400;">(up to 10)</span></label>
          <input type="file" id="case-screenshots" accept="image/*" multiple style="display: none;" onchange="handleScreenshotsUpload(event)" />
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('case-screenshots').click()">Choose Files</button>
          <div id="screenshots-preview" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px;"></div>
          <input type="hidden" name="screenshots" id="case-screenshots-data" />
        </div>
        
        <div class="form-group">
          <label>Video URL</label>
          <input type="url" name="video_url" placeholder="YouTube or Vimeo URL" />
        </div>
      </div>
      
      <!-- TESTIMONIAL -->
      <div class="form-section">
        <h3 class="section-title">TESTIMONIAL</h3>
        
        <div class="form-group">
          <label>Testimonial Quote</label>
          <textarea name="testimonial_quote" rows="3" placeholder="What did the client say about your work?"></textarea>
        </div>
        
        <div class="form-group">
          <label>Testimonial Author</label>
          <input type="text" name="testimonial_author" placeholder="Name, Title at Company" />
        </div>
      </div>
      
      <!-- SEO -->
      <div class="form-section">
        <h3 class="section-title">SEO</h3>
        
        <div class="form-group">
          <label>SEO Title</label>
          <input type="text" name="seo_title" maxlength="60" oninput="updateCharCount(this, 'seo-title-count', 60)" />
          <div class="char-count"><span id="seo-title-count">0</span>/60 characters</div>
        </div>
        
        <div class="form-group">
          <label>SEO Description</label>
          <textarea name="seo_description" rows="3" maxlength="160" oninput="updateCharCount(this, 'seo-desc-count', 160)"></textarea>
          <div class="char-count"><span id="seo-desc-count">0</span>/160 characters</div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Author</label>
            <input type="text" name="author" value="Naqvix Team" />
            <div class="field-hint">Shown as the byline in schema.org Article. Defaults to "Naqvix Team".</div>
          </div>
          <div class="form-group">
            <label>Publish Date</label>
            <input type="date" name="publish_date" />
            <div class="field-hint">Leave blank to use creation date. Back-date older projects here.</div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Order</label>
          <input type="number" name="order" value="0" style="width: 120px;" />
        </div>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-secondary">Save & Close</button>
        <button type="submit" class="btn btn-primary">Publish Case Study</button>
      </div>
      
      <div style="text-align: center; margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary);">
        Your changes save automatically — closing won't lose your work.
      </div>
    </form>
  `);
  
  // Initialize Quill editors for Challenge, Solution, Results
  window.challengeEditor = new Quill("#challenge-editor", { theme: "snow", placeholder: "Describe the challenge...", modules: { toolbar: [["bold", "italic", { header: [1, 2, 3, false] }], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] } });
  window.solutionEditor = new Quill("#solution-editor", { theme: "snow", placeholder: "Describe the solution...", modules: { toolbar: [["bold", "italic", { header: [1, 2, 3, false] }], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] } });
  window.resultsEditor = new Quill("#results-editor", { theme: "snow", placeholder: "Describe the results...", modules: { toolbar: [["bold", "italic", { header: [1, 2, 3, false] }], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] } });
  
  // Initialize technologies tags
  initTechTags();
}

async function editCase(id) {
  try {
    const { data } = await apiCall(`/cases/${id}`);
    currentEditType = "case"; currentEditId = id;
    const resultsText = Array.isArray(data.results) ? data.results.join("\n") : "";
    openModal("Edit Case Study", `<form class="modal-form" onsubmit="saveCase(event)"><div class="form-group"><label>Title *</label><input type="text" name="title" value="${data.title}" required /></div><div class="form-group"><label>Client Name</label><input type="text" name="client" value="${data.client || ""}" /></div><div class="form-group"><label>Industry</label><input type="text" name="industry" value="${data.industry || ""}" /></div><div class="form-group"><label>Challenge</label><textarea name="challenge" rows="3">${data.challenge || ""}</textarea></div><div class="form-group"><label>Solution</label><textarea name="solution" rows="3">${data.solution || ""}</textarea></div><div class="form-group"><label>Results (one per line)</label><textarea name="results" rows="3">${resultsText}</textarea></div><div class="form-group"><label>Image URL</label><input type="url" name="image_url" value="${data.image_url || ""}" /></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="published" ${data.published ? "checked" : ""} />Published</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update Case Study</button></div></form>`);
  } catch (err) { showToast("Failed to load case study", "error"); }
}

async function saveCase(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const projectTypes = formData.getAll("project_type");
  
  const payload = { 
    title: formData.get("title"), 
    client: formData.get("client"), 
    industry: formData.get("industry") || "",
    challenge: window.challengeEditor ? window.challengeEditor.root.innerHTML : "", 
    solution: window.solutionEditor ? window.solutionEditor.root.innerHTML : "", 
    results: window.resultsEditor ? window.resultsEditor.root.innerHTML : "",
    image_url: caseLogoData || "",
    published: 1,
    // New fields
    logo: caseLogoData || "",
    project_type: projectTypes,
    location: formData.get("location") || "",
    status: formData.get("status") || "Live",
    website_url: formData.get("website_url") || "",
    featured: formData.get("featured") ? 1 : 0,
    screenshots: caseScreenshots,
    video_url: formData.get("video_url") || "",
    technologies: techTags,
    metrics: metrics.filter(m => m.label && m.value), // Only include filled metrics
    deliverables: deliverables.filter(d => d), // Only include non-empty deliverables
    testimonial_quote: formData.get("testimonial_quote") || "",
    testimonial_author: formData.get("testimonial_author") || "",
    seo_title: formData.get("seo_title") || "",
    seo_description: formData.get("seo_description") || "",
    author: formData.get("author") || "Naqvix Team",
    publish_date: formData.get("publish_date") || "",
    order_index: parseInt(formData.get("order")) || 0
  };
  
  try {
    if (currentEditId) { 
      await apiCall(`/cases/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) }); 
      showToast("Case study updated successfully!"); 
    } else { 
      await apiCall("/cases", { method: "POST", body: JSON.stringify(payload) }); 
      showToast("Case study created successfully!"); 
    }
    closeModal(); 
    loadCases();
    // Reset case study data
    caseLogoData = null;
    caseScreenshots = [];
    techTags = [];
    metrics = [];
    deliverables = [];
  } catch (err) { 
    showToast(err.message || "Failed to save case study", "error"); 
  }
}

async function deleteCase(id) {
  if (!confirm("Are you sure you want to delete this case study?")) return;
  try { await apiCall(`/cases/${id}`, { method: "DELETE" }); showToast("Case study deleted successfully!"); loadCases(); }
  catch (err) { showToast("Failed to delete case study", "error"); }
}

// Testimonials
let currentTestimonialTab = "pending";
async function loadTestimonials(tab = "pending") {
  currentTestimonialTab = tab;
  try {
    const { data } = await apiCall("/testimonials?all=true");
    const filtered = tab === "pending" ? data.filter(t => !t.approved) : data.filter(t => t.approved);
    const container = document.getElementById("testimonials-list");
    if (!filtered.length) { container.innerHTML = `<p class="text-center" style="padding: 40px; color: var(--text-secondary)">No ${tab} testimonials</p>`; return; }
    container.innerHTML = filtered.map(t => `<div class="testimonial-card"><div class="testimonial-header"><div class="testimonial-avatar">${t.avatar_url ? `<img src="${t.avatar_url}" alt="${t.author}" />` : t.author.charAt(0).toUpperCase()}</div><div class="testimonial-info"><h4>${t.author}</h4><div class="testimonial-meta">${t.role || ""}${t.role && t.company ? " at " : ""}${t.company || ""}</div></div></div><div class="testimonial-quote">"${t.quote}"</div><div class="testimonial-actions">${!t.approved ? `<button class="btn btn-sm btn-success" onclick="approveTestimonial('${t.id}')">Approve</button>` : ""}<button class="btn btn-sm btn-secondary" onclick="editTestimonial('${t.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${t.id}')">Delete</button></div></div>`).join("");
  } catch (err) { showToast("Failed to load testimonials", "error"); }
}

function newTestimonial() {
  currentEditType = "testimonial"; currentEditId = null;
  openModal("Add Testimonial", `<form class="modal-form" onsubmit="saveTestimonial(event)"><div class="form-group"><label>Author Name *</label><input type="text" name="author" required /></div><div class="form-group"><label>Role / Position</label><input type="text" name="role" placeholder="e.g., CEO, Marketing Director" /></div><div class="form-group"><label>Company</label><input type="text" name="company" /></div><div class="form-group"><label>Quote / Review *</label><textarea name="quote" rows="4" required></textarea></div><div class="form-group"><label>Avatar URL</label><input type="url" name="avatar_url" placeholder="https://..." /></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="approved" />Approve immediately</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Add Testimonial</button></div></form>`);
}

async function editTestimonial(id) {
  try {
    const { data } = await apiCall(`/testimonials?all=true`);
    const testimonial = data.find(t => t.id === id);
    if (!testimonial) throw new Error("Testimonial not found");
    currentEditType = "testimonial"; currentEditId = id;
    openModal("Edit Testimonial", `<form class="modal-form" onsubmit="saveTestimonial(event)"><div class="form-group"><label>Author Name *</label><input type="text" name="author" value="${testimonial.author}" required /></div><div class="form-group"><label>Role / Position</label><input type="text" name="role" value="${testimonial.role || ""}" /></div><div class="form-group"><label>Company</label><input type="text" name="company" value="${testimonial.company || ""}" /></div><div class="form-group"><label>Quote / Review *</label><textarea name="quote" rows="4" required>${testimonial.quote}</textarea></div><div class="form-group"><label>Avatar URL</label><input type="url" name="avatar_url" value="${testimonial.avatar_url || ""}" /></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="approved" ${testimonial.approved ? "checked" : ""} />Approved</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update Testimonial</button></div></form>`);
  } catch (err) { showToast("Failed to load testimonial", "error"); }
}

async function saveTestimonial(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const payload = { author: formData.get("author"), role: formData.get("role"), company: formData.get("company"), quote: formData.get("quote"), avatar_url: formData.get("avatar_url"), approved: formData.get("approved") ? 1 : 0 };
  try {
    if (currentEditId) { await apiCall(`/testimonials/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) }); showToast("Testimonial updated successfully!"); }
    else { await apiCall("/testimonials", { method: "POST", body: JSON.stringify(payload) }); showToast("Testimonial added successfully!"); }
    closeModal(); loadTestimonials(currentTestimonialTab);
  } catch (err) { showToast(err.message || "Failed to save testimonial", "error"); }
}

async function approveTestimonial(id) {
  try { await apiCall(`/testimonials/${id}/approve`, { method: "PATCH" }); showToast("Testimonial approved!"); loadTestimonials(currentTestimonialTab); }
  catch (err) { showToast("Failed to approve testimonial", "error"); }
}

async function deleteTestimonial(id) {
  if (!confirm("Are you sure you want to delete this testimonial?")) return;
  try { await apiCall(`/testimonials/${id}`, { method: "DELETE" }); showToast("Testimonial deleted successfully!"); loadTestimonials(currentTestimonialTab); }
  catch (err) { showToast("Failed to delete testimonial", "error"); }
}

// Portfolio
async function loadPortfolio() {
  try {
    const { data } = await apiCall("/portfolio");
    const grid = document.getElementById("portfolio-grid");
    if (!data.length) { grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-secondary)">No portfolio items yet. Add your first project!</div>'; return; }
    grid.innerHTML = data.map(item => `<div class="portfolio-card"><div class="portfolio-image">${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" />` : "🖼️"}</div><div class="portfolio-body"><div class="portfolio-title">${item.title}</div><div class="portfolio-category">${item.category || "Uncategorized"}</div><div class="portfolio-actions"><button class="btn btn-sm btn-secondary" onclick="editPortfolio('${item.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deletePortfolio('${item.id}')">Delete</button></div></div></div>`).join("");
  } catch (err) { showToast("Failed to load portfolio", "error"); }
}

function newPortfolio() {
  currentEditType = "portfolio"; currentEditId = null;
  openModal("Add Portfolio Item", `<form class="modal-form" onsubmit="savePortfolio(event)"><div class="form-group"><label>Title *</label><input type="text" name="title" required /></div><div class="form-group"><label>Category</label><input type="text" name="category" placeholder="e.g., Web Design, Branding, UI/UX" /></div><div class="form-group"><label>Description</label><textarea name="description" rows="3"></textarea></div><div class="form-group"><label>Result Label</label><input type="text" name="result_label" placeholder="e.g., +150% Traffic, $50K Revenue" /></div><div class="form-group"><label>Image URL *</label><input type="url" name="image_url" placeholder="https://..." required /></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="featured" />Featured project</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Add to Portfolio</button></div></form>`);
}

async function editPortfolio(id) {
  try {
    const { data } = await apiCall(`/portfolio`);
    const item = data.find(p => p.id === id);
    if (!item) throw new Error("Portfolio item not found");
    currentEditType = "portfolio"; currentEditId = id;
    openModal("Edit Portfolio Item", `<form class="modal-form" onsubmit="savePortfolio(event)"><div class="form-group"><label>Title *</label><input type="text" name="title" value="${item.title}" required /></div><div class="form-group"><label>Category</label><input type="text" name="category" value="${item.category || ""}" /></div><div class="form-group"><label>Description</label><textarea name="description" rows="3">${item.description || ""}</textarea></div><div class="form-group"><label>Result Label</label><input type="text" name="result_label" value="${item.result_label || ""}" /></div><div class="form-group"><label>Image URL *</label><input type="url" name="image_url" value="${item.image_url || ""}" required /></div><div class="form-group"><label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" name="featured" ${item.featured ? "checked" : ""} />Featured project</label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update Portfolio</button></div></form>`);
  } catch (err) { showToast("Failed to load portfolio item", "error"); }
}

async function savePortfolio(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const payload = { title: formData.get("title"), category: formData.get("category"), description: formData.get("description"), result_label: formData.get("result_label"), image_url: formData.get("image_url"), featured: formData.get("featured") ? 1 : 0 };
  try {
    if (currentEditId) { await apiCall(`/portfolio/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) }); showToast("Portfolio item updated successfully!"); }
    else { await apiCall("/portfolio", { method: "POST", body: JSON.stringify(payload) }); showToast("Portfolio item added successfully!"); }
    closeModal(); loadPortfolio();
  } catch (err) { showToast(err.message || "Failed to save portfolio item", "error"); }
}

async function deletePortfolio(id) {
  if (!confirm("Are you sure you want to delete this portfolio item?")) return;
  try { await apiCall(`/portfolio/${id}`, { method: "DELETE" }); showToast("Portfolio item deleted successfully!"); loadPortfolio(); }
  catch (err) { showToast("Failed to delete portfolio item", "error"); }
}

// Contacts
async function loadContacts() {
  try {
    const { data } = await apiCall("/contacts");
    const tbody = document.getElementById("contacts-tbody");
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-secondary)">No contact messages yet</td></tr>'; return; }
    tbody.innerHTML = data.map(contact => `<tr style="${!contact.read_status ? 'background: rgba(77, 147, 255, 0.05);' : ''}"><td><strong>${contact.name}</strong></td><td>${contact.email}</td><td>${contact.phone || "—"}</td><td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${contact.message}</td><td>${new Date(contact.created_at).toLocaleDateString()}</td><td><div class="action-btns">${!contact.read_status ? `<button class="btn btn-sm btn-success" onclick="markAsRead('${contact.id}')">Mark Read</button>` : ""}<button class="btn btn-sm btn-danger" onclick="deleteContact('${contact.id}')">Delete</button></div></td></tr>`).join("");
  } catch (err) { showToast("Failed to load contacts", "error"); }
}

async function markAsRead(id) {
  try { await apiCall(`/contacts/${id}/read`, { method: "PATCH" }); showToast("Marked as read!"); loadContacts(); loadOverview(); }
  catch (err) { showToast("Failed to mark as read", "error"); }
}

async function deleteContact(id) {
  if (!confirm("Are you sure you want to delete this contact?")) return;
  try { await apiCall(`/contacts/${id}`, { method: "DELETE" }); showToast("Contact deleted successfully!"); loadContacts(); }
  catch (err) { showToast("Failed to delete contact", "error"); }
}

// Settings
async function loadSettings() {
  try {
    const { data } = await apiCall("/settings");
    const form = document.getElementById("settings-form");
    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = data[key] || "";
    });
  } catch (err) { showToast("Failed to load settings", "error"); }
}

async function saveSettings(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const feedback = document.getElementById("settings-feedback");
  const payload = {};
  for (const [key, value] of formData.entries()) payload[key] = value;
  try {
    await apiCall("/settings", { method: "PUT", body: JSON.stringify(payload) });
    feedback.textContent = "Settings saved successfully!";
    feedback.className = "form-feedback success";
    setTimeout(() => { feedback.className = "form-feedback"; }, 3000);
  } catch (err) {
    feedback.textContent = err.message || "Failed to save settings";
    feedback.className = "form-feedback error";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item[data-view]").forEach(item => {
    item.addEventListener("click", (e) => { e.preventDefault(); switchView(item.getAttribute("data-view")); });
  });
  document.getElementById("hamburger").addEventListener("click", () => document.getElementById("sidebar").classList.add("open"));
  document.getElementById("sidebar-close").addEventListener("click", () => document.getElementById("sidebar").classList.remove("open"));
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => { if (e.target.id === "modal-overlay") closeModal(); });
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("nexora_admin_token");
      window.location.href = "index.html";
    }
  });
  document.getElementById("new-blog-btn").addEventListener("click", newBlog);
  document.getElementById("new-case-btn").addEventListener("click", newCase);
  document.getElementById("new-testimonial-btn").addEventListener("click", newTestimonial);
  document.getElementById("new-portfolio-btn").addEventListener("click", newPortfolio);
  document.getElementById("new-team-btn").addEventListener("click", newTeamMember);
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadTestimonials(btn.getAttribute("data-tab"));
    });
  });
  document.getElementById("settings-form").addEventListener("submit", saveSettings);
  switchView("overview");
});

// Team Members
async function loadTeam() {
  try {
    const { data } = await apiCall("/team");
    const tbody = document.getElementById("team-tbody");
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-secondary)">No team members yet. Add your first team member!</td></tr>'; return; }
    tbody.innerHTML = data.map(member => {
      const perms = JSON.parse(member.permissions || "[]");
      const permLabels = { blogs: "Blogs", cases: "Cases", testimonials: "Reviews", portfolio: "Portfolio", contacts: "Contacts", settings: "Settings" };
      const permText = perms.length ? perms.map(p => permLabels[p] || p).join(", ") : "No access";
      return `<tr><td><strong>${member.name}</strong></td><td>${member.email}</td><td><span class="role-badge role-${member.role}">${member.role}</span></td><td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${permText}</td><td><span class="status-badge ${member.status === 'active' ? 'status-published' : 'status-draft'}">${member.status}</span></td><td><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editTeamMember('${member.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteTeamMember('${member.id}')">Delete</button></div></td></tr>`;
    }).join("");
  } catch (err) { showToast("Failed to load team members", "error"); }
}

function newTeamMember() {
  currentEditType = "team"; currentEditId = null;
  openModal("Add Team Member", `<form class="modal-form" onsubmit="saveTeamMember(event)"><div class="form-group"><label>Full Name *</label><input type="text" name="name" required /></div><div class="form-group"><label>Email *</label><input type="email" name="email" required /></div><div class="form-group"><label>Password *</label><input type="password" name="password" required minlength="6" /></div><div class="form-group"><label>Role</label><select name="role"><option value="editor">Editor</option><option value="manager">Manager</option><option value="viewer">Viewer</option></select></div><div class="form-group"><label>Permissions (Select what they can access)</label><div class="permissions-grid"><label class="permission-item"><input type="checkbox" name="permissions" value="blogs" /> Blogs</label><label class="permission-item"><input type="checkbox" name="permissions" value="cases" /> Case Studies</label><label class="permission-item"><input type="checkbox" name="permissions" value="testimonials" /> Testimonials</label><label class="permission-item"><input type="checkbox" name="permissions" value="portfolio" /> Portfolio</label><label class="permission-item"><input type="checkbox" name="permissions" value="contacts" /> Contacts</label><label class="permission-item"><input type="checkbox" name="permissions" value="settings" /> Settings</label></div></div><div class="form-group"><label>Status</label><select name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Add Team Member</button></div></form>`);
}

async function editTeamMember(id) {
  try {
    const { data } = await apiCall(`/team/${id}`);
    currentEditType = "team"; currentEditId = id;
    const perms = JSON.parse(data.permissions || "[]");
    openModal("Edit Team Member", `<form class="modal-form" onsubmit="saveTeamMember(event)"><div class="form-group"><label>Full Name *</label><input type="text" name="name" value="${data.name}" required /></div><div class="form-group"><label>Email *</label><input type="email" name="email" value="${data.email}" required /></div><div class="form-group"><label>New Password (leave blank to keep current)</label><input type="password" name="password" minlength="6" /></div><div class="form-group"><label>Role</label><select name="role"><option value="editor" ${data.role === 'editor' ? 'selected' : ''}>Editor</option><option value="manager" ${data.role === 'manager' ? 'selected' : ''}>Manager</option><option value="viewer" ${data.role === 'viewer' ? 'selected' : ''}>Viewer</option></select></div><div class="form-group"><label>Permissions (Select what they can access)</label><div class="permissions-grid"><label class="permission-item"><input type="checkbox" name="permissions" value="blogs" ${perms.includes('blogs') ? 'checked' : ''} /> Blogs</label><label class="permission-item"><input type="checkbox" name="permissions" value="cases" ${perms.includes('cases') ? 'checked' : ''} /> Case Studies</label><label class="permission-item"><input type="checkbox" name="permissions" value="testimonials" ${perms.includes('testimonials') ? 'checked' : ''} /> Testimonials</label><label class="permission-item"><input type="checkbox" name="permissions" value="portfolio" ${perms.includes('portfolio') ? 'checked' : ''} /> Portfolio</label><label class="permission-item"><input type="checkbox" name="permissions" value="contacts" ${perms.includes('contacts') ? 'checked' : ''} /> Contacts</label><label class="permission-item"><input type="checkbox" name="permissions" value="settings" ${perms.includes('settings') ? 'checked' : ''} /> Settings</label></div></div><div class="form-group"><label>Status</label><select name="status"><option value="active" ${data.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update Team Member</button></div></form>`);
  } catch (err) { showToast("Failed to load team member", "error"); }
}

async function saveTeamMember(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const permissions = formData.getAll("permissions");
  const payload = { name: formData.get("name"), email: formData.get("email"), role: formData.get("role"), permissions, status: formData.get("status") };
  if (formData.get("password")) payload.password = formData.get("password");
  try {
    if (currentEditId) { await apiCall(`/team/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) }); showToast("Team member updated successfully!"); }
    else { await apiCall("/team", { method: "POST", body: JSON.stringify(payload) }); showToast("Team member added successfully!"); }
    closeModal(); loadTeam();
  } catch (err) { showToast(err.message || "Failed to save team member", "error"); }
}

async function deleteTeamMember(id) {
  if (!confirm("Are you sure you want to delete this team member? They will lose access immediately.")) return;
  try { await apiCall(`/team/${id}`, { method: "DELETE" }); showToast("Team member deleted successfully!"); loadTeam(); }
  catch (err) { showToast("Failed to delete team member", "error"); }
}
