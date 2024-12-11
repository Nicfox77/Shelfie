let editMode = false;

function toggleEditMode() {
    editMode = !editMode;
    const formElements = document.querySelectorAll('#profileForm input');
    formElements.forEach(element => {
        element.disabled = !editMode;
        if (editMode) {
            element.classList.add('editable');
        } else {
            element.classList.remove('editable');
        }
    });
    const saveButton = document.querySelector('#profileForm button');
    if (saveButton) {
        saveButton.style.display = editMode ? 'block' : 'none';
    }
    const toggleButton = document.querySelector('button[onclick="toggleEditMode()"]');
    if (toggleButton) {
        toggleButton.textContent = editMode ? 'Cancel' : 'Modify';
    }
}

async function saveProfile() {
    const emailInput = document.querySelector('input[name="email"]');
    const newEmail = emailInput.value;

    if (newEmail !== currentEmail) {
        openModal('confirmationCodeModal');
        const response = await fetch('/profile/send-confirmation-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newEmail }),
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message);
        }
    } else {
        openModal('passwordModal');
    }
}

function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal.hide();
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
        const response = await updateProfile({ confirmationCode, password });

        if (!response.ok) {
            const result = await response.json();
            alert(result.message);
            closeModal('passwordModal');
            openModal('confirmationCodeModal');
        }
    }
}

async function updateProfile(data) {
    const form = document.getElementById('profileForm');
    const formData = {
        firstname: form.querySelector('[name="firstname"]').value,
        lastname: form.querySelector('[name="lastname"]').value,
        username: form.querySelector('[name="username"]').value,
        email: form.querySelector('[name="email"]').value,
        confirmationCode: data.confirmationCode || '',
        password: data.password || '',
    };

    const response = await fetch('/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });

    if (response.ok) {
        window.location.href = '/profile';
    } else {
        return response;
    }
}