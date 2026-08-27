// =============================================
// DENTALIGN - Admin Panel
// =============================================

// Check authentication
const isLoggedIn = localStorage.getItem('dentalign_admin') === 'true';

if (!isLoggedIn) {
    // Redirect to login page
    window.location.href = 'login.html';
}

// Display admin info
const adminEmail = localStorage.getItem('dentalign_admin_email') || 'Admin';
const loginTime = localStorage.getItem('dentalign_admin_login_time');
const loginDate = loginTime ? new Date(loginTime).toLocaleString() : 'Unknown';

console.log(`🔐 Logged in as: ${adminEmail}`);
console.log(`🕐 Login time: ${loginDate}`);

// Add admin info to navbar if logged in
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.navbar .container');
    if (navContainer && isLoggedIn) {
        const adminInfo = document.createElement('span');
        adminInfo.style.cssText = 'font-size: 0.75rem; color: var(--text-light); margin-left: 12px;';
        adminInfo.innerHTML = `<i class="bi bi-person-check me-1"></i> ${adminEmail}`;
        navContainer.querySelector('.badge').after(adminInfo);
    }
});

function logout() {
    // Clear admin session
    localStorage.removeItem('dentalign_admin');
    localStorage.removeItem('dentalign_admin_email');
    localStorage.removeItem('dentalign_admin_login_time');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

function loadAppointments() {
    const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
    
    // Update stats
    document.getElementById('totalCount').textContent = bookings.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.appointment_date === today);
    document.getElementById('todayCount').textContent = todayBookings.length;
    
    const pending = bookings.filter(b => b.status === 'pending');
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('confirmedCount').textContent = confirmed.length;
    
    // Populate table
    const tbody = document.getElementById('appointmentsTable');
    
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-calendar-x" style="font-size: 2rem; color: var(--text-muted);"></i>
                    <p class="mt-2 mb-0">No appointments found</p>
                    <p class="text-muted" style="font-size: 0.8rem;">New bookings will appear here</p>
                </td>
            </tr>`;
        return;
    }
    
    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    tbody.innerHTML = bookings.map((b, i) => `
        <tr>
            <td><strong>${b.appointment_date}</strong></td>
            <td>${b.appointment_time}</td>
            <td>
                <strong>${b.patient_name}</strong>
                ${b.patient_email ? `<br><small style="color: var(--text-light);">${b.patient_email}</small>` : ''}
            </td>
            <td>${b.service}</td>
            <td>${b.patient_phone}</td>
            <td>
                <span class="badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-warning'}">
                    ${b.status}
                </span>
            </td>
            <td>
                <div class="d-flex gap-1">
                    ${b.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="updateStatus(${i}, 'confirmed')" title="Confirm">
                            <i class="bi bi-check-lg"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBooking(${i})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStatus(index, newStatus) {
    const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
    if (bookings[index]) {
        bookings[index].status = newStatus;
        localStorage.setItem('dentalign_bookings', JSON.stringify(bookings));
        loadAppointments();
        showToast('Appointment marked as confirmed!', 'success');
    }
}

function deleteBooking(index) {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
        const deletedBooking = bookings[index];
        bookings.splice(index, 1);
        localStorage.setItem('dentalign_bookings', JSON.stringify(bookings));
        loadAppointments();
        showToast(`Booking for ${deletedBooking.patient_name} deleted.`, 'warning');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
    `;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: var(--white);
        border: 1px solid ${type === 'warning' ? 'var(--danger)' : 'var(--success)'};
        color: var(--text-dark);
        padding: 12px 20px;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-lg);
        font-size: 0.85rem;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    toast.innerHTML = `
        <i class="bi bi-${type === 'warning' ? 'exclamation-triangle' : 'check-circle'}" 
           style="color: ${type === 'warning' ? 'var(--danger)' : 'var(--success)'};"></i>
        ${message}
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toastContainer.remove(), 300);
    }, 3000);
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Load appointments on page load
loadAppointments();

// Auto-refresh every 30 seconds
setInterval(loadAppointments, 30000);

console.log('%c📊 DentAlign Admin Panel %c| %cReady',
    'font-weight:900; color:#0d9488;',
    '',
    'color:#64748b;');