document.addEventListener("DOMContentLoaded", function() {
    // Add event listeners to all "Add to Shelf" buttons
    document.querySelectorAll(".add-to-shelf").forEach(button => {
        button.addEventListener("click", addToShelf);
    });

    // Add event listeners to all "Remove from Shelf" buttons
    document.querySelectorAll(".remove-from-shelf").forEach(button => {
        button.addEventListener("click", removeFromShelf);
    });
});

// Functions
async function addToShelf() {
    let isbn = this.id; // 'this' refers to the button that was clicked
    let url = `/shelf/add/${isbn}`;
    let response = await fetch(url, { method: 'POST' }); // Use POST method

    if (response.ok) {
        alert("Book added to shelf");
        // Optionally, update the button text and class here
        this.textContent = "Remove from Shelf";
        this.classList.remove("add-to-shelf");
        this.classList.add("remove-from-shelf");
    } else {
        alert("Failed to add book to shelf");
    }
}

// Functions
async function removeFromShelf() {
    let isbn = this.id;
    let url = `/shelf/remove/${isbn}`;
    let response = await fetch(url, { method: 'POST' });

    console.log(response); // Log the response for debugging

    if (response.ok) {
        alert("Book removed from shelf");
        // Update button text and class here
    } else {
        const errorMessage = await response.text(); // Get error message from response
        alert(`Failed to remove book from shelf: ${errorMessage}`);
    }
}