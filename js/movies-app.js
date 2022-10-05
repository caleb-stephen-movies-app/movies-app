$(function() {


    // async function getUserLastCommitAsync(username) {
    //     try {
    //         let response = await fetch(`https://api.github.com/users/${username}`);
    //         let events = await response.json();
    //         console.log(events);
    //     }
    //     catch(err) {
    //         console.log(err);
    //     }
    // }


    // declare global moviesurl variable
    const moviesURL = "https://liberating-military-cyclone.glitch.me/movies";
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
        let movieData = await moviesPromise;
        console.log(movieData)
        movieData.forEach((movie) =>{
            cardDiv.append(`
                <div>
                    <h2>Title: ${movie.title.toUpperCase()}</h2>
                    <p>Genre: ${movie.genre}</p>
                    <img src=${movie.poster}>
                    <p>Plot :${movie.plot}</p>
                    <p>Director: ${movie.director}</p>
                    <p>Actors: ${movie.actors}</p>
                    <p>Year: ${movie.year}</p>
                </div>
            `);
        });
    }

    async function addMovie(id) {
        // finding all movie data for movie with id
        let movieData = await findMovie(id).then(results => results);
        console.log(movieData);
        let movieToAdd = {
            title: movieData.title,
            poster: `https://image.tmdb.org/t/p/original/${movieData.poster_path}`,


        }

        // add movie to our db
        // initialize post
        // const postOptions = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type' : 'application/json'
        //     },
        //     body: JSON.stringify(bookToPost)
        // }

        // re print all the movies
    }

    async function findMovie(id){
        try {
            let response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`);
            let data = await response.json();
            return data;
        } catch(err) {
            console.log(err);
        }
    }

    async function searchForMovies(title) {
        console.log("inside getNewMovieData " + title);
        try {
            let response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${title}&include_adult=false`);
            let data = await response.json();
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

    $("#addMovieBtn").click(() => {
        console.log($("#addMovieText").data("movie-id"));
    });


});