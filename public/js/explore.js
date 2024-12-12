// Event Listeners
document.querySelector("#exploreForm").addEventListener("submit", function(event) {
    validateForm(event);
});

const sortElement = document.querySelector("#sort");
if (sortElement) {
    sortElement.addEventListener("change", sortBooks);
}

// Functions
function validateForm(e) {
    document.querySelector("#searchError").innerHTML = "";
    let search = document.querySelector(".exploreSearch").value; // get search value
    // Display error message if there is no search or is an empty string
    if (!search || search == "") {
        document.querySelector("#searchError").innerHTML = "Please enter a search";
        document.querySelector("#searchError").style.color = "Red";
        e.preventDefault();
    }
}

function sortBooks() {
    let sortValue = document.querySelector("#sort").value;
    let bookContainer = document.querySelector("#bookResults");
    let books = Array.from(bookContainer.querySelectorAll(".exploreBook")); // Get array of books from book container

    // Sort books based on sortValue
    books.sort((a, b) => {
        if (sortValue === "rating") {
            return b.dataset.rating - a.dataset.rating; // Sort by rating
        } else if (sortValue === "newest") {
            return new Date(b.dataset.published_date) - new Date(a.dataset.published_date); // Sort by published date
        } else if (sortValue === "alphabetical") {
            return a.dataset.title.localeCompare(b.dataset.title); // Sort by title (alphabetical)
        }
    });

    bookContainer.innerHTML = "";
    books.forEach(book => bookContainer.appendChild(book)); // Add sorted list of books back to book container
}