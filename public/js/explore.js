// Event Listeners
const sortElement = document.querySelector("#sort");
if (sortElement) {
    sortElement.addEventListener("change", sortBooks);
}

// Functions
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