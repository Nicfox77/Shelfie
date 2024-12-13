import fetch from "node-fetch";
import dotenv from 'dotenv';
import pool from '../config/db.mjs';

// Function to search for books using API
export const searchBooks = async (search, category="title") => {
    const apiKey = process.env.API_KEY;
    // Set API search category
    let queryCategory = "intitle"; // Default to title search

    if (category === "author")
    {
        queryCategory = "inauthor";
    }
    
    const url = `https://www.googleapis.com/books/v1/volumes?q=${queryCategory}:${search}&orderBy=relevance&key=${apiKey}&maxResults=40&filter=ebooks`;
    
    const conn = await pool.getConnection();
    try {
        let sql, params;

        if (category === "title") {
            sql = `SELECT isbn, title, author, genre, rating, image, published_date
                   FROM Books
                   WHERE title LIKE ?`;
            params = [`%${search}%`];
        } else if (category === "author") {
            sql = `SELECT isbn, title, author, genre, rating, image, published_date
                   FROM Books
                   WHERE author LIKE ?`;
            params = [`%${search}%`];
        }  
        
        let [rows] = await conn.query(sql, params);
        if (rows.length > 0) {
            // Convert rating
            for (let row of rows) {
                let rating = Number(row.rating); 
                if (rating % 1 === 0) {
                    row.rating = rating.toFixed(0);  // Remove decimals
                } else {
                    row.rating = rating.toFixed(1);  // Keep one decimal
                }
            }
            // Match MySql results to API format and return results
            return rows.map((row) => ({
                source: 'mysql',
                isbn: row.isbn,
                title: row.title,
                authors: [row.author],
                averageRating: row.rating,
                categories: [row.genre],
                image: row.image,
                publishedDate: row.published_date,
            })); 
        }

        try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) return [];

        // Filter out items that do not meet the criteria
        let filteredBooks = data.items.filter((item) => {
            const info = item.volumeInfo;
            const hasRequiredFields = info.title && info.authors && info.averageRating && info.categories;
            const hasValidIsbn = item.volumeInfo.industryIdentifiers && 
                         item.volumeInfo.industryIdentifiers.some(identifier =>
                            identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10');

            return hasRequiredFields && hasValidIsbn;
        });

        // Remove duplicates by title (and optionally authors)
        const uniqueBooks = [];
        const seen = new Set();

        filteredBooks.forEach((book) => {
            const info = book.volumeInfo;
            const uniqueKey = `${info.title.toLowerCase()}|${info.authors?.join(",").toLowerCase()}`;

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                // Transform thumbnail URL
                let thumbnail = info.imageLinks?.thumbnail || '/imgs/defaultCover.png';
                if (thumbnail.startsWith('http://')) {
                    thumbnail = thumbnail.replace('http://', 'https://');
                }
                if (thumbnail.includes('zoom=')) {
                    thumbnail = thumbnail.replace(/zoom=\d+/, 'zoom=3');
                }
                if (thumbnail.includes('&edge=curl'))
                {
                    thumbnail = thumbnail.replace('&edge=curl', '');
                }
                // Format published date to YYYY-MM-DD if only year/month is provided
                let formattedPublishedDate = info.publishedDate;
                if (formattedPublishedDate) {
                    if (/^\d{4}$/.test(formattedPublishedDate)) {
                        formattedPublishedDate += '-01-01'; // Add default month and day
                    } else if (/^\d{4}-\d{2}$/.test(formattedPublishedDate)) {
                        formattedPublishedDate += '-01'; // Add default day
                    }
                }
                uniqueBooks.push({
                    source: 'api',
                    isbn:  info.industryIdentifiers?.[0]?.identifier?.replace(/\D/g, ''),
                    title: info.title?.replace(/[^a-zA-Z0-9\s]/g, ''),
                    authors: info.authors.join(", "),
                    averageRating: info.averageRating,
                    categories: info.categories.join(", ").replace(/[^\x00-\x7F]/g, ''),
                    image: thumbnail,
                    description: info.description,
                    publisher: info.publisher,
                    publishedDate: formattedPublishedDate,
                    page_count: info.pageCount,
                });
            }
        });

        // Insert unique books into MySql database
        for (const book of uniqueBooks) {
            if (book.isbn) {
                let insertSql = `INSERT INTO Books (isbn, title, author, genre, description, publisher, page_count, published_date, rating, image)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                title = VALUES(title),
                                author = VALUES(author),
                                genre = VALUES(genre),
                                description = VALUES(description),
                                publisher = VALUES(publisher),
                                page_count = VALUES(page_count),
                                published_date = VALUES(published_date),
                                rating = VALUES(rating),
                                image = VALUES(image)`;
                let insertParams = [book.isbn, book.title, book.authors, book.categories, book.description, book.publisher, 
                                    book.page_count, book.publishedDate, book.averageRating, book.image];
                await conn.query(insertSql, insertParams);
            }
        }

        return uniqueBooks;
        } catch (error)
        {
        console.error("Error fetching books:", error);
        return [];
        }
    } finally {
        conn.release();
    }
    
};

export const checkShelf = async (isbn, user_id) => {
    const conn = await pool.getConnection();
    try {
        let sql = `SELECT * FROM UserBooks
                   WHERE isbn = ? AND user_id = ?`;
        let params = [isbn, user_id];
        let [rows] = await conn.query(sql, params);
        return rows.length > 0;
    } finally {
        conn.release();
    }
}

export const selectSearch = async () => {
    
}

export const getReadBooks = async (user_id) => {
    const conn = await pool.getConnection();
    try {
      let sql = `SELECT * FROM Books
                 INNER JOIN UserBooks ON Books.isbn = UserBooks.isbn
                 WHERE UserBooks.user_id = ? AND UserBooks.status = 'Read'`;
      let params = [user_id];
      let [rows] = await conn.query(sql, params);
      return rows;
    } finally {
      conn.release();
    }
}
  
  export const getUnreadBooks = async (user_id) => {
    const conn = await pool.getConnection();
    let sql = `SELECT * FROM Books
                INNER JOIN UserBooks ON Books.isbn = UserBooks.isbn
                WHERE UserBooks.user_id = ? AND UserBooks.status = 'To Read'`;
    let params = [user_id];
    let [rows] = await conn.query(sql, params);
    return rows;
  }

  export const getUserShelf = async (userId) => {
    const conn = await pool.getConnection();
    const query = `
      SELECT isbn
      FROM UserBooks
      WHERE user_id = ?`;
    
    const [results] = await conn.query(query, [userId]);
    return results;
  }