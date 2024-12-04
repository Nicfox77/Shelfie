import fetch from "node-fetch";


///IF WE WANT TO USE GOOGLE BOOKS API
// async function checkImageExists(url)
// {
//     try
//     {
//         const response = await fetch(url, { method: 'HEAD' });
//         return response.status === 200 && response.headers.get('content-type').startsWith('image/');
//     } catch (error)
//     {
//         return false;
//     }
// }

// Function to search for books using API
// export const searchBooks = async (search) => {
//     let apiKey = "AIzaSyBgU9hi9Eyt_Qm8dmI49RfcUuvJJ9ktzWE";
//     let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${search}&orderBy=relevance&key=${apiKey}&maxResults=40`;
//     let response = await fetch(url);
//     let data = await response.json();
    
//     // Check if the book has a cover image
//     for (let i = 0; i < data.items.length; i++)
//     {
//         const identifiers = data.items[i].volumeInfo.industryIdentifiers;
//         const isbn10 = identifiers?.find(id => id.type === 'ISBN_10')?.identifier;
//         if (isbn10)
//         {
//             let openlibimg = `https://covers.openlibrary.org/b/isbn/${isbn10}-M.jpg`;
//             const imageExists = await checkImageExists(openlibimg);
//             if (imageExists)
//             {
//                 console.log("Valid cover:", openlibimg);
//             } else
//             {
//                 console.log("No cover found for ISBN:", isbn10);
//                 // You could set a default cover image here
//                 // openlibimg = 'path/to/default-cover.jpg';
//             }
//         }
//     }
//     return data.items || [];
// };



export const searchBooks = async (searchQuery) =>
{
    try
    {
        // Define common broad genres to match against
        const commonGenres = new Set([
            'Fiction',
            'Science Fiction',
            'Fantasy',
            'Mystery',
            'Romance',
            'Thriller',
            'Horror',
            'Historical Fiction',
            'Literary Fiction',
            'Young Adult',
            'Biography',
            'History',
            'Non-fiction',
            'Poetry',
            'Drama',
            'Adventure',
            'Children\'s',
            'Crime'
        ]);

        // Helper function to find matching genres
        const findMainGenres = (subjects) =>
        {
            if (!subjects) return [];

            // Convert subjects to lowercase for case-insensitive matching
            const lowercaseSubjects = subjects.map(s => s.toLowerCase());

            return Array.from(commonGenres)
                .filter(genre =>
                {
                    const lowercaseGenre = genre.toLowerCase();
                    return lowercaseSubjects.some(subject =>
                        subject.includes(lowercaseGenre) ||
                        subject === lowercaseGenre
                    );
                })
                .slice(0, 3); // Limit to top 3 genres
        };

        const baseUrl = 'https://openlibrary.org/search.json';
        const queryParams = new URLSearchParams({
            q: searchQuery,
            limit: '50',
            lang: 'en',
            fields: 'key,title,author_name,subject,cover_i,ratings_average,ratings_count'
        });

        const bookUrl = `${baseUrl}?${queryParams}`;
        const response = await fetch(bookUrl);

        if (!response.ok)
        {
            throw new Error('Failed to fetch books');
        }

        const data = await response.json();

        const books = data.docs
            .filter(book =>
            {
                const mainGenres = findMainGenres(book.subject);
                return (
                    book.title &&
                    book.author_name?.length > 0 &&
                    book.subject?.length > 0 &&
                    mainGenres.length > 0 &&  // Must have at least one main genre
                    book.cover_i &&
                    book.ratings_average &&
                    book.ratings_count
                );
            })
            .slice(0, 20)
            .map(book => ({
                title: book.title,
                author: book.author_name[0],
                genres: findMainGenres(book.subject),
                coverUrl: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
                rating: {
                    average: Number(book.ratings_average.toFixed(1)),
                    count: book.ratings_count
                }
            }));

        console.log('Found complete books:', books);
        console.log('Number of complete books found:', books.length);
        return books;

    } catch (error)
    {
        console.error('Error searching books:', error);
        throw error;
    }
};