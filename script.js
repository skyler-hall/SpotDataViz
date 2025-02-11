// chat.js
import { songList } from './spotify_top_hits_clean_json.js';
//import { API_KEY } from '../temp.js';
//--------------------------------------------------------------------------------

const API_KEY = "BQDbx5GxIQCjjMJ31GSmpMcGZxaEWt5sST6ku_gBoZ3rc3iKVWL7_bsmoC368W_L8rxvSCSTJRvSV2OUFmymtkWP2BmwuSg760dc4IZ1c3J3DQccri-yTKq8B5r4KlSOeWAY1v2pZvc"

function showForm() { //displays the search entry bar
    const resultCard = document.getElementById('result-card')
    resultCard.innerHTML = ''
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

const handleSubmit = async (event) => { //calls the spotify api to search for the artist
    event.preventDefault()
    console.log(event)

    const inputForm = document.getElementById('artist-input')
    const artistRequested = inputForm.value
    console.log(artistRequested)
    const artists = await searchArtist(artistRequested)
    displayArtistCards(artists)
}

/* ---------------------------------------------------------------------------------------------------------------------------------------------------------- */

async function searchArtist(artist) {//makes an api call to find and retrieve 5 artists
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
    const cleanedArtistData = retrievedArtists.map((artist) => (
        {
            id: artist.id,
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

function displayArtistCards(artistDetails) {//displays the artists found to the screen

    const resultCard = document.getElementById('result-card')
    resultCard.innerHTML = ''
    showForm()

    console.log("Artist details : ", artistDetails)

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
                        <span>${artist.genre} ◆ </span>
                        <span>${artist.followers} Followers ◆ </span>
                        <span>Popularity ${artist.popularity}</span>
                    </div>
                </div>
            </div>
            <h6 class="visit-link"><a href=${artist.link}>Visit Artist</a></h6>
            </div>
            `
            
            card.addEventListener('click', () => {handleArtistClick(artist.id)})
            cardsContainer.appendChild(card)
        })
        
        resultCard.append(cardsContainer)
}

const handleArtistClick = async (artistID) => {
    console.log(artistID)
     const albums = await getAlbums(artistID)
     displayAlbums(albums) 
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function getAlbums(artistID) { //makes an api call to retrieve 5 of the artist's albums
    const requestURL = `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&limit=5&offset=0`
    const details = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    }
    
    const result = await fetch(requestURL, details)
    const json = await result.json()

    console.log(json)

    const retrievedAlbums = json.items
    const cleanedAlbumData = retrievedAlbums.map((album) => (
        {
            id: album.id,
            name: album.name,
            link: album.external_urls.spotify,
            numTracks: album.total_tracks,
            image: (album.images.length > 0 ? album.images[0].url : ''),
            released: album.release_date,
            type: album.album_type,
        }
    ))

    console.log(cleanedAlbumData)
    return cleanedAlbumData
}

function displayAlbums(albumDetails) { //displays the found albums to the screen
    const resultCard = document.getElementById('result-card')
    resultCard.innerHTML = ''
    showForm()
    
    console.log("Album details : ", albumDetails)
    
    const cardsContainer = document.createElement('div')
    albumDetails.forEach((album) => {
        const card = document.createElement('div')
        card.innerHTML = 
            `
            <div class="card-container">
                <div class="detail-container">
                    <div class="img-container">
                        <img src=${album.image ? album.image : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'} alt=${album.name}/>
                    </div>
                    <div class="info-container">
                        <h4>
                            ${album.name}
                        </h4>
                        <div>
                            <span>${album.numTracks} Tracks ◆ </span>
                            <span> Released ${album.released} ◆ </span>
                            <span>${album.type}</span>
                        </div>
                    </div>
                </div>
            <h6 class="visit-link"><a href=${album.link}>Visit Album</a></h6>
            </div>
                `
        card.addEventListener('click', () => {handleAlbumClick(album)})
        cardsContainer.appendChild(card)
    })
        
    resultCard.append(cardsContainer)
}

const handleAlbumClick = async (album) => { //when an album is clicked, display its tracks
    const tracks = await getAlbumTracks(album.id, album.numTracks)
    displayTracks(tracks, album.image)
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const getAlbumTracks = async (albumID, numTracks) => { //make an api call to retrieve an album's tracks
    const requestURL = `https://api.spotify.com/v1/albums/${albumID}/tracks?limit=${numTracks}&offset=0`
    const details = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${API_KEY}`
        }
    }

    const response = await fetch(requestURL, details)
    const json = await response.json()
    console.log(json)

    const retrievedTracks = json.items
    
    const cleanedTracks = retrievedTracks.map((track) => (
        {
            id: track.id,
            name: track.name,
            artists: track.artists,
            link: track.external_urls.spotify,
            duration: track.duration_ms,
        }
    ))

    console.log(cleanedTracks)
    return cleanedTracks
}

function displayTracks(trackDetails, image) { //displays the tracks of a selected album
    const resultCard = document.getElementById('result-card')
    resultCard.innerHTML = ''
    showForm()
    
    console.log("Track details : ", trackDetails)
    
    const cardsContainer = document.createElement('div')
    trackDetails.forEach((track) => {
        const card = document.createElement('div')
        card.innerHTML = 
        `
            <div class="card-container">
                <div class="detail-container">
                    <div class="img-container">
                        <img src=${image ? image : 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'} alt=${track.name}/>
                    </div>
                    <div class="info-container">
                        <h4>
                        ${track.name}
                        </h4>
                        <div>
                            <span>${Math.floor(track.duration / 60000)} minutes ◆ </span>
                            <span>${track.artists.map((artist) => (" " + artist.name))}</span>
                        </div>
                    </div>
                </div>
                <div class="button-container">
                    <h6 class="visit-link" style="text-align:center"><a href=${track.link}>Visit Song</a></h6>
                    <button class="visit-link add-btn" id="add-button">Add Song to Dataset</button>
                </div>
            </div>
                    `
            const addButton = card.getElementsByClassName('add-btn').item(0)
            addButton.addEventListener('click', () => {addTrackToData(track.id)})
            cardsContainer.appendChild(card)
        })
        
        resultCard.append(cardsContainer)
}
    
    const addTrackToData = async (trackID) => { //adds the selected track to the dataset
        console.log(trackID)
        const requestURL = `https://api.spotify.com/v1/tracks/${trackID}`
        const details = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        }
    
        const response = await fetch(requestURL, details)
        const json = await response.json()
        console.log(json)
    
        const trackDetails = {
            "song": json.name,
            "year": json.album.release_date.split('-')[0],
            "loudness": -5.335, //Spotify's api doesn't provide the loudness nor genre of a track, so we'll use the medians of our dataset as filler
            "genre": "pop"
        }
    
        songList.push(trackDetails)
        console.log(songList.at(-1))
    }
    
    //--------------------------------------------------------------------------------================================================
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
