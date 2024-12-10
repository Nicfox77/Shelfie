function toggleEditMode() {
    const url = new URL(window.location.href);
    const editMode = url.searchParams.get('editMode') === 'true';
    url.searchParams.set('editMode', !editMode);
    window.location.href = url.toString();
}

async function saveProfile() {
    const emailInput = document.querySelector('input[name="email"]');
    const newEmail = emailInput.value;

    console.log(newEmail, currentEmail);
    if (newEmail !== currentEmail) {
        const response = await fetch('/profile/send-confirmation-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newEmail }),
        });

        const data = await response.json();
        if (response.ok) {
            openModal('confirmationCodeModal');
        } else {
            alert(data.message);
        }
    } else {
        openModal('passwordModal');
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function submitConfirmationCode() {
    const confirmationCode = document.getElementById('confirmationCodeInput').value;
    if (confirmationCode) {
        closeModal('confirmationCodeModal');
        openModal('passwordModal');
    }
}

async function submitPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password) {
        const confirmationCode = document.getElementById('confirmationCodeInput').value;
        await updateProfile({ confirmationCode, password });
    }
}

async function updateProfile(data) {
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    formData.append('confirmationCode', data.confirmationCode || '');
    formData.append('password', data.password || '');

    const response = await fetch('/profile', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        window.location.href = '/profile';
    } else {
        const result = await response.json();
        alert(result.message);
    }
}