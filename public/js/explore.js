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

    // Sory books based on sortValue
    books.sort((a, b) => {
        if (sortValue === "rating") {
            return b.dataset.rating - a.dataset.rating; 
        } else if (sortValue === "newest") {
            return new Date(b.dataset.published_date) - new Date(a.dataset.published_date);
        } else if (sortValue === "alphabetical") {
            return a.dataset.title.localeCompare(b.dataset.title);
        }
    });

    bookContainer.innerHTML = "";
    books.forEach(book => bookContainer.appendChild(book));
}