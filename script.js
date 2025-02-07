// chat.js
import { songList } from './spotify_top_hits_clean_json.js';
//const API_KEY = process.env.API_KEY
import { API_KEY } from '../temp.js';
//--------------------------------------------------------------------------------

function showForm() {
    const resultCard = document.getElementById('result-card')

    const artistSearch = document.createElement('div')
    artistSearch.innerHTML =
    `
    <form id="artist-search-form">
        <label for="artist-input">Search for an artist</label>
        <input type="text" name="artist" id="artist-input" placeholder="Taylor Swift">
        <button type="submit" id="submit-button">Search</button>
    </form>
    `
    resultCard.prepend(artistSearch)
    
    const form = document.getElementById('artist-search-form')
    form.addEventListener('submit', handleSubmit)
}

const handleSubmit = async (event) => {
    event.preventDefault()
    console.log(event)

    const inputForm = document.getElementById('artist-input')
    const artistRequested = inputForm.value
    console.log(artistRequested)
    const artists = await searchArtist(API_KEY, artistRequested)
    displayArtistCards(artists)
}

async function searchArtist(API_KEY, artist) {
    //search for the artist
    const requestURL = `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=5&offset=0`
    const details = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    }
    const result = await fetch(requestURL, details)

    const json = await result.json()

    console.log(json)

    const retrievedArtists = json.artists.items

    console.log(retrievedArtists)

    const cleanedArtistData = retrievedArtists.map((artist, index) => (
        {
            name: artist.name, //string
            link: artist.external_urls.spotify, //string - url
            followers: artist.followers.total, //int
            popularity: artist.popularity,
            genre: artist.genres, //list of strings
            image: (artist.images.length > 0 ? artist.images[0].url : '') //string - url
        }
    ))

    console.log(cleanedArtistData)
    return cleanedArtistData
}

async function getAlbums(API_KEY, artistID) {
    
    
}

async function getAlbumTracks(API_KEY, albumID) {
    
}

function displayArtistCards(artistDetails) {
    //artist details should be a list of artist objects with the
    //information to be displayed

    const resultCard = document.getElementById('result-card')
    resultCard.innerHTML = ''
    showForm()

    console.log("ARtist details : ", artistDetails)

    const cardsContainer = document.createElement('div')
    artistDetails.forEach((artist) => {
        const card = document.createElement('div')
        card.innerHTML = 
            `
            <div class="card-container">
            <div class="detail-container">
                <div class="img-container">
                    <img src=${artist.image ? artist.image : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'} alt=${artist.name}/>
                </div>
                <div class="info-container">
                    <h4>
                        ${artist.name}
                    </h4>
                    <div>
                        <span>${artist.genre}</span>
                        <span>${artist.followers} Followers</span>
                        <span>Popularity ${artist.popularity}</span>
                    </div>
                </div>
            </div>
            <h6 class="visit-link"><a href=${artist.link}>Visit Artist</a></h6>
            </div>
            `

        cardsContainer.appendChild(card)
        })

    resultCard.append(cardsContainer)
}


function displayAlbums(albumDetails) {

}

function displayTracks(trackDetails) {

}

// async function fetchArtist(API_KEY, id) {
//     const result = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
//         method: "GET", headers: {Authorization: `Bearer ${API_KEY}`}
//     })

//     return await result.json()
// }

//console.log(fetchArtist(API_KEY, '0TnOYISbd1XYRBk9myaseg'))


//--------------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.result-button');
    const resultCard = document.getElementById('result-card');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;

            if (buttonText === 'Most Common Genre') {
                createGenreChart();
            } else if (buttonText === 'Average Year Song Released') {
                createYearChart();
            } else if (buttonText === 'Loudest Song') {
                createLoudestSongChart();
            } else if(buttonText === 'Search')
                showForm();
        });
    });

    function createGenreChart() {
        const genreCounts = {};
        songList.forEach(song => {
            const genres = song.genre.split(',').map(g => g.trim());
            genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        });

        const labels = Object.keys(genreCounts);
        const data = Object.values(genreCounts);

        const canvas = document.createElement('canvas');
        canvas.id = 'genreChart';
        resultCard.innerHTML = ''; // Clear previous content
        resultCard.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Songs',
                    data: data,
                    backgroundColor: 'rgba(35, 255, 64, 0.8)',
                    borderColor: 'rgb(0, 0, 0)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createYearChart() {
            
        const yearCounts = {};
        songList.forEach(song => {
            const year = song.year;
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });

        const labels = Object.keys(yearCounts);
        const data = Object.values(yearCounts);

        const canvas = document.createElement('canvas');
        canvas.id = 'yearChart';
        resultCard.innerHTML = ''; // Clear previous content
        resultCard.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Songs by Year',
                    data: data,
                    backgroundColor: [
                        'rgb(23, 255, 23)',
                        'rgb(4, 83, 8)',
                        'rgb(12, 207, 29)'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                }
            }
        });
    }

    function createLoudestSongChart() {

        // Sort the songList by loudness in descending order
        const sortedSongs = [...songList].sort((a, b) => b.loudness - a.loudness);

        // Take the top 10 loudest songs
        const top10Loudest = sortedSongs.slice(0, 10);
    
        // Extract song names and loudness values
        const labels = top10Loudest.map(song => song.song);
        const data = top10Loudest.map(song => song.loudness);
    
        const canvas = document.createElement('canvas');
        canvas.id = 'loudestSongChart';
        resultCard.innerHTML = ''; // Clear previous content
        resultCard.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                  label: 'Loudest Song',
                  data: data,
                  fill: false,
                  borderColor: 'rgb(5, 255, 5)',
                  tension: 0.1
                }]
            },
        });
    }


});
