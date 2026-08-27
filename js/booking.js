// =============================================
// DENTALIGN - Booking Wizard Script
// Project 3: CloudExify Internship 2026
//
// AUTHOR: Saira Sehar
// REGISTRATION: CX-INT-2026-GEN-0488
//
// DESCRIPTION: Multi-step appointment booking
// system with validation, slot checking, and
// localStorage persistence for bookings.
// =============================================

// Booking wizard state
let currentStep = 1;
const totalSteps = 4;
let isBookingSubmitted = false;

// Wait for DOM to fully load before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Booking Wizard Initialized');
    updateSteps();
    
    // Set minimum date (tomorrow) for appointment
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Check available slots when date changes
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showToast('Please select a future date.', 'error');
                this.value = '';
            } else {
                checkAvailableSlots(this.value);
            }
        });
    }
});

// =============================================
// STEP NAVIGATION FUNCTIONS
// These are global so HTML onclick can access them
// =============================================

// Go to next step (with validation)
window.nextStep = function(step) {
    console.log('➡️ Moving to step:', step);
    
    // Validate current step before proceeding
    if (step === 2 && !validateStep1()) return;
    if (step === 3 && !validateStep2()) return;
    if (step === 4 && !validateStep3()) return;
    
    currentStep = step;
    updateSteps();
    
    // Generate summary when reaching confirmation step
    if (step === 4) {
        generateSummary();
    }
};

// Go back to previous step
window.prevStep = function(step) {
    console.log('⬅️ Going back to step:', step);
    currentStep = step;
    updateSteps();
};

// =============================================
// VALIDATION FUNCTIONS
// =============================================

// Validate Step 1: Service selection
function validateStep1() {
    const selected = document.querySelector('input[name="service"]:checked');
    if (!selected) {
        showToast('Please select a service to continue.', 'error');
        return false;
    }
    console.log('✅ Service selected:', selected.value);
    return true;
}

// Validate Step 2: Date and Time selection
function validateStep2() {
    const date = document.getElementById('appointmentDate')?.value;
    const time = document.getElementById('appointmentTime')?.value;
    
    if (!date) {
        showToast('Please select a date.', 'error');
        document.getElementById('appointmentDate')?.focus();
        return false;
    }
    
    if (!time) {
        showToast('Please select a time slot.', 'error');
        document.getElementById('appointmentTime')?.focus();
        return false;
    }
    
    // Check if slot is already booked
    if (isSlotBooked(date, time)) {
        showToast('Sorry, this time slot is already booked. Please choose another.', 'error');
        return false;
    }
    
    console.log('✅ Date and time selected:', date, time);
    return true;
}

// Validate Step 3: Patient details
function validateStep3() {
    const name = document.getElementById('patientName')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim();
    const email = document.getElementById('patientEmail')?.value.trim();
    
    // Name validation
    if (!name) {
        showToast('Please enter your full name.', 'error');
        document.getElementById('patientName')?.focus();
        return false;
    }
    
    if (name.length < 3) {
        showToast('Name must be at least 3 characters.', 'error');
        document.getElementById('patientName')?.focus();
        return false;
    }
    
    // Phone validation (Pakistani format)
    if (!phone) {
        showToast('Please enter your phone number.', 'error');
        document.getElementById('patientPhone')?.focus();
        return false;
    }
    
    if (!isValidPakistaniPhone(phone)) {
        showToast('Please enter a valid Pakistani phone number.\nExamples: 03001234567, 3001234567, +923001234567', 'error');
        document.getElementById('patientPhone')?.focus();
        return false;
    }
    
    // Email validation (optional but must be valid if provided)
    if (email && !isValidEmail(email)) {
        showToast('Please enter a valid email address or leave it empty.', 'error');
        document.getElementById('patientEmail')?.focus();
        return false;
    }
    
    console.log('✅ Patient details valid:', name, phone);
    return true;
}

// =============================================
// HELPER VALIDATION FUNCTIONS
// =============================================

// Validate Pakistani phone number format
function isValidPakistaniPhone(phone) {
    const cleaned = phone.replace(/[\s\-+]/g, '');
    return /^03\d{9}$/.test(cleaned) || 
           /^3\d{9}$/.test(cleaned) || 
           /^923\d{9}$/.test(cleaned);
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check if a time slot is already booked
function isSlotBooked(date, time) {
    const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
    return bookings.some(b => 
        b.appointment_date === date && 
        b.appointment_time === time && 
        b.status === 'confirmed'
    );
}

// =============================================
// UI UPDATE FUNCTIONS
// =============================================

// Update step indicators and show current step content
function updateSteps() {
    console.log('🔄 Updating to step:', currentStep);
    
    // Hide all step contents
    for (let i = 1; i <= totalSteps; i++) {
        const content = document.getElementById(`step${i}Content`);
        if (content) {
            content.style.display = 'none';
        }
    }
    
    // Show current step content with animation
    const currentContent = document.getElementById(`step${currentStep}Content`);
    if (currentContent) {
        currentContent.style.display = 'block';
        currentContent.style.animation = 'fadeInStep 0.3s ease';
    }
    
    // Update step indicator circles
    document.querySelectorAll('.step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');
        if (stepNum === currentStep) {
            stepEl.classList.add('active');
        }
        if (stepNum < currentStep) {
            stepEl.classList.add('completed');
        }
    });
    
    // Scroll to top of booking wizard
    const wizard = document.getElementById('bookingWizard');
    if (wizard) {
        const wizardTop = wizard.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: wizardTop, behavior: 'smooth' });
    }
}

// Generate booking summary for confirmation step
function generateSummary() {
    const service = document.querySelector('input[name="service"]:checked')?.value || 'Not selected';
    const date = document.getElementById('appointmentDate')?.value || 'Not selected';
    const time = document.getElementById('appointmentTime')?.value || 'Not selected';
    const doctor = document.getElementById('preferredDoctor')?.value || 'No preference';
    const name = document.getElementById('patientName')?.value || 'Not provided';
    const phone = document.getElementById('patientPhone')?.value || 'Not provided';
    const email = document.getElementById('patientEmail')?.value || 'Not provided';
    const notes = document.getElementById('patientNotes')?.value || 'None';
    
    const summaryHTML = `
        <div class="summary-row">
            <span class="summary-label">Service</span>
            <span class="summary-value">${service}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Date</span>
            <span class="summary-value">${formatDate(date)}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Time</span>
            <span class="summary-value">${formatTime(time)}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Doctor</span>
            <span class="summary-value">${doctor}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Patient Name</span>
            <span class="summary-value">${name}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Phone</span>
            <span class="summary-value">${phone}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Email</span>
            <span class="summary-value">${email || 'Not provided'}</span>
        </div>
        ${notes !== 'None' ? `
        <div class="summary-row">
            <span class="summary-label">Notes</span>
            <span class="summary-value">${notes}</span>
        </div>` : ''}
    `;
    
    document.getElementById('bookingSummary').innerHTML = summaryHTML;
    console.log('📋 Booking summary generated');
}

// =============================================
// BOOKING CONFIRMATION
// =============================================

// Global function called from Confirm button
window.confirmBooking = function() {
    console.log('✅ Confirm booking clicked');
    
    // Prevent double submission
    if (isBookingSubmitted) {
        showToast('Booking already submitted. Please wait.', 'warning');
        return;
    }
    
    // Double-check all validations
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
        currentStep = 1;
        updateSteps();
        return;
    }
    
    // Final slot availability check
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    
    if (isSlotBooked(date, time)) {
        showToast('Sorry, this slot was just booked. Please choose another.', 'error');
        currentStep = 2;
        updateSteps();
        return;
    }
    
    // Set submitting flag to prevent double clicks
    isBookingSubmitted = true;
    
    // Disable confirm button and show loading state
    const confirmBtn = document.querySelector('#step4Content .btn-primary-custom');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';
    }
    
    // Gather booking data
    const bookingData = {
        id: Date.now(),
        patient_name: document.getElementById('patientName')?.value.trim(),
        patient_phone: document.getElementById('patientPhone')?.value.trim(),
        patient_email: document.getElementById('patientEmail')?.value.trim() || '',
        service: document.querySelector('input[name="service"]:checked')?.value,
        appointment_date: date,
        appointment_time: time,
        doctor: document.getElementById('preferredDoctor')?.value || 'No preference',
        notes: document.getElementById('patientNotes')?.value.trim() || '',
        status: 'confirmed',
        created_at: new Date().toISOString()
    };
    
    // Save to localStorage (simulating backend)
    setTimeout(() => {
        const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('dentalign_bookings', JSON.stringify(bookings));
        
        console.log('💾 Booking saved:', bookingData);
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset submission flag
        isBookingSubmitted = false;
        
        // Reset form after modal is closed
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            resetBookingForm();
        }, { once: true });
    }, 500);
};

// =============================================
// RESET FUNCTION
// =============================================

function resetBookingForm() {
    // Clear radio buttons
    document.querySelectorAll('input[name="service"]').forEach(r => r.checked = false);
    
    // Clear all input fields
    document.getElementById('appointmentDate').value = '';
    document.getElementById('appointmentTime').value = '';
    document.getElementById('preferredDoctor').value = '';
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientEmail').value = '';
    document.getElementById('patientNotes').value = '';
    
    // Reset confirm button
    const confirmBtn = document.querySelector('#step4Content .btn-primary-custom');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i> Confirm Booking';
    }
    
    // Reset to step 1
    currentStep = 1;
    updateSteps();
    console.log('🔄 Booking form reset to step 1');
}

// =============================================
// SLOT AVAILABILITY CHECK
// =============================================

function checkAvailableSlots(selectedDate) {
    const bookings = JSON.parse(localStorage.getItem('dentalign_bookings') || '[]');
    const bookedTimes = bookings
        .filter(b => b.appointment_date === selectedDate && b.status === 'confirmed')
        .map(b => b.appointment_time);
    
    console.log(`📅 Checking slots for ${selectedDate}`);
    console.log('🚫 Already booked times:', bookedTimes);
    
    const timeSelect = document.getElementById('appointmentTime');
    if (timeSelect) {
        Array.from(timeSelect.options).forEach(option => {
            if (option.value && bookedTimes.includes(option.value)) {
                option.disabled = true;
                option.textContent = option.textContent.replace(' (Booked)', '') + ' (Booked)';
            } else if (option.value) {
                option.disabled = false;
                option.textContent = option.textContent.replace(' (Booked)', '');
            }
        });
    }
}

// =============================================
// FORMATTING HELPERS
// =============================================

// Format date for display (e.g., "Monday, August 25, 2026")
function formatDate(dateStr) {
    if (!dateStr) return 'Not selected';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format time for display (e.g., "10:30 AM")
function formatTime(timeStr) {
    if (!timeStr) return 'Not selected';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

// =============================================
// TOAST NOTIFICATION (Fallback)
// =============================================

function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            z-index: 99999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: var(--white, #ffffff);
        border-left: 4px solid ${type === 'success' ? 'var(--success, #10b981)' : type === 'error' ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)'};
        color: var(--text-dark, #1e293b);
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 10px;
        animation: slideInToast 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 400px;
    `;
    
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        warning: 'bi-info-circle-fill'
    };
    
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.success}" 
           style="color: ${type === 'success' ? 'var(--success, #10b981)' : type === 'error' ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)'}; font-size: 1.1rem;"></i>
        <span>${message.replace(/\n/g, '<br>')}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Console confirmation
console.log('✅ Booking Wizard Script Loaded');
console.log('👤 Author: Saira Sehar | CloudExify Internship 2026');