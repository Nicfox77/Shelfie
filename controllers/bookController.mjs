import fetch from "node-fetch";

// Function to search for books using API
export const searchBooks = async (search) => {
    let apiKey = "AIzaSyBgU9hi9Eyt_Qm8dmI49RfcUuvJJ9ktzWE";
    let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${search}&orderBy=relevance&key=${apiKey}&maxResults=40`;
    let response = await fetch(url);
    let data = await response.json();
    return data.items || [];
};