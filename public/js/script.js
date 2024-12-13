// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".editBook").addEventListener("click", editBook);
});
// Functions
async function editBook() {
    var myModal = new bootstrap.Modal(document.getElementById('editBookModal'));
    myModal.show();
    let isbn = this.id;
    // Make local API call to get information for book
    let url = `/Explore/api/edit/${isbn}`;
    let response = await fetch(url);
    let data = await response.json();
    let book = data.book;

    // Put form inside the modal
    let editBook = document.querySelector("#editBook");
    editBook.innerHTML = `<form method="POST" action="/book/edit" class="editBookForm">
                                <input type="hidden" name="isbn" value="${book.isbn}">
                                <input type="text" name="title" value="${book.title}" class="my-4" placeholder="Title" required>
                                <input type="text" name="author" value="${book.author}" class="mb-4" placeholder="Author" required>
                                <textarea type="text" name="description" class="mb-4" placeholder="Description">${book.description}</textarea>
                                <input type="number" name="rating" value="${book.rating}" min="1" max="5" step="0.1" class="mb-4" placeholder="Rating" required>
                                <input type="text" name="genre" value="${book.genre}" class="mb-4" placeholder="Genre" required>
                                <input type="text" name="image" value="${book.image}" class="mb-4" placeholder="Image Url" required>
                                <div class="editBookBtns my-4">
                                    <button type="submit" class="edit">Edit</button>
                                    <button type="button" class="delete">Delete</button>
                                </div>
                          </form>`;
                          
    // Add event listener for delete button
    document.querySelector(".delete").addEventListener("click", async function() {
        // Ask for confirmation before deleting book
        let confirm = window.confirm("Are you sure you want to delete this book?");
        
        // Delete book if confirmed
        if(confirm) {
            let deleteIsbn = book.isbn;
            let deleteUrl = `/book/delete?isbn=${deleteIsbn}`;
            let deleteResponse = await fetch(deleteUrl);

            // If book is sucessfully deleted, redirect to explore page and display alert
            if (deleteResponse.ok) {
                alert(`${book.title} has been successfully deleted`);
                window.location.href = "/Explore";
            } else {
                console.log("Error deleting book");
            }
        }
    });
}