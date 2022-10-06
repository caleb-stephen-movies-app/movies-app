$(function() {


    // declare global moviesurl variable
    const moviesURL = "https://liberating-military-cyclone.glitch.me/movies";
    // const TMDB_URL =
    let allMoviesPromise;

    async function getAllMovies() {
        try {
            let response = await fetch(moviesURL);
            let data = await response.json();
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    async function printAllMovies(moviesPromise) {
        const cardDiv = $("#cardDiv");
        cardDiv.empty();
        moviesPromise.then(movieData => {
            movieData.forEach((movie) => {
                cardDiv.append(`
                    <div>
                        <h2>Title: ${movie.title.toUpperCase()}</h2>
                        <p>Genre: ${movie.genre}</p>
                        <img src=${movie.poster}>
                        <p>Plot :${movie.plot}</p>
                        <p>Director: ${movie.director}</p>
                        <p>Actors: ${movie.actors}</p>
                        <p>Year: ${movie.year}</p>
                        <button class="deleteBtn" data-delete="${movie.id}">Delete Btn</button>
                    </div>
                `);
            });
        });
    }

    async function addMovie(id) {
        // finding all movie data for movie with id
        let movieData = await findMovie(id).then(results => results);
        let movieToAdd = {
            title: movieData.title,
            poster: `https://image.tmdb.org/t/p/original/${movieData.poster_path}`,
            year: movieData.release_date.substring(0,4),
            genre: getGenres(movieData.genres),
            plot: movieData.overview
        }

        // add movieToAdd to our database

        // initialize post
        const postOptions = {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(movieToAdd)
        }

        fetch(moviesURL, postOptions).then(() => {
            // clear text box
            $("#addMovieText").val('');
            // clear movies list
            $("#moviesList").empty();
            // reprint all movies
            printAllMovies(getAllMovies());
        });
    }

    function getGenres(genreArray) {
        return genreArray.reduce((genresString, genre, index) => {
            if(index === 0){
                return genre.name;
            } else {
                return `${genresString}, ${genre.name}`
            }
        }, '');

    }

    async function findMovie(id){
        try {
            let response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
            let data = await response.json();
            console.log(data);
            return data;
        } catch(err) {
            console.log(err);
        }
    }

    async function searchForMovies(title) {
        try {
            let response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${title}&include_adult=false`);
            let data = await response.json();
            console.log(data);
            return data;
        } catch(err) {
            console.log(err);
        }
    }

    async function populateMoviesList(title) {
        let movieList = await searchForMovies(title).then(results => results);
        $("#moviesList").empty();
        movieList.results.forEach((movie, index) => {
            if(index < 6) {
                $("#moviesList").append(`
                    <div class="col-2">
                        <div class="card" data-movie-id="${movie.id}" style="height: 200px;">
                            <h5 class="movie-list-item">${movie.title}</h5>
                        </div>
                    </div>
                `);
            }
        });
    }


    async function deleteMovie(id){
        let deleteOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type' : 'application/json'
            }
        }
        let deleteData = await fetch(`${moviesURL}/${id}`, deleteOptions).then(results => results);
        printAllMovies(getAllMovies());
    }
    // <option className="movie-list-item" data-movie-id="${movie.id}">${movie.original_title}</option>


    // populating our allmoviespromise so that when we get the results it will have a JSON file with all the movies
    allMoviesPromise = getAllMovies();

    // calling function to print all the movies on screen
    printAllMovies(allMoviesPromise);

    // update movieList on space and enter
    $("#addMovieText").keyup(e => {
        if(e.key === "Enter" || e.key === " "){
            populateMoviesList($("#addMovieText").val());
        }
    });

    // update movieList on keyup
    // $("#addMovieText").keyup(e => {
    //     populateMoviesList($("#addMovieText").val())
    // });

    $(document.body).on("click", "#moviesList .card", function() {
        addMovie($(this).attr("data-movie-id"));
    });

    $(document.body).on("click", ".deleteBtn", function (e){
        e.preventDefault()
        deleteMovie($(this).attr("data-delete"))

    })


});