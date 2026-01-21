/**
 * Toast Notification System
 * Simple, elegant toast notifications for admin panel
 */

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success'
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

    toast.innerHTML = `
    ${icon}
    <span class="flex-1">${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Auto-show toasts from server-side flash messages
document.addEventListener('DOMContentLoaded', function () {
    // Check for flash messages in data attributes
    const flashError = document.body.getAttribute('data-flash-error');
    const flashSuccess = document.body.getAttribute('data-flash-success');

    if (flashError) {
        showToast(flashError, 'error');
    }

    if (flashSuccess) {
        showToast(flashSuccess, 'success');
    }
});
