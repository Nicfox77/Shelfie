import fetch from "node-fetch";
import dotenv from 'dotenv';
// Function to search for books using API
export const searchBooks = async (search) =>
{
    const apiKey = process.env.API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${search}&orderBy=relevance&key=${apiKey}&maxResults=40`;

    try
    {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) return [];

        // Filter out items that do not meet the criteria
        let filteredBooks = data.items.filter((item) =>
        {
            const info = item.volumeInfo;
            const hasRequiredFields = info.title && info.authors && info.averageRating && info.categories;

            return hasRequiredFields;
        });

        // Remove duplicates by title (and optionally authors)
        const uniqueBooks = [];
        const seen = new Set();

        filteredBooks.forEach((book) =>
        {
            const info = book.volumeInfo;
            const uniqueKey = `${info.title.toLowerCase()}|${info.authors?.join(",").toLowerCase()}`;

            if (!seen.has(uniqueKey))
            {
                seen.add(uniqueKey);
                uniqueBooks.push(book);
            }
        });

        return uniqueBooks;
    } catch (error)
    {
        console.error("Error fetching books:", error);
        return [];
    }
};
