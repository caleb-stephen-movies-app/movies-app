$(function() {


    // declare global moviesurl variable
    const moviesURL = "https://liberating-military-cyclone.glitch.me/movies";
    // const TMDB_URL =
    let allMoviesPromise;

    const addMovieModal = new bootstrap.Modal('#addMovieModal', {
        keyboard: false
    });


    async function getAllMovies() {
        try {
            let response = await fetch(moviesURL);
            let data = await response.json();
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    async function getMovieInfo(id) {
        let allMoviesData = await getAllMovies();
        for(let movie of allMoviesData) {
            if(movie.id === parseInt(id)) {
                return movie;
            }
        }

    }

    async function printAllMovies(moviesPromise) {
        const cardDiv = $("#cardsDiv");
        cardDiv.empty();
        moviesPromise.then(movieData => {
            movieData.forEach((movie) => {
                printMovieCard(cardDiv, movie);
            });
        });
    }

    function printSingleMovieModal(modalDiv, movie) {

        let modalHeaderDiv = modalDiv.children().children().children().first();
        let modalBodyDiv = $("#singleMovie");
        modalHeaderDiv.empty();
        modalHeaderDiv.append(`
            <h5 class="modal-title text-light">${movie.title}</h5>
            <button id="modalCloseBtn" type="button" class="btn-close" data-bs-dismiss="modal"></button>
        `);
        modalBodyDiv.empty();
        modalBodyDiv.attr("data-movie-id", movie.id);
        modalBodyDiv.append(`
             <p>Genre: ${movie.genre}</p>
             <p>Plot :${movie.plot}</p>
             <p>Year: ${movie.year}</p>
             <button class="deleteBtn">Delete Btn</button>
             <button class="editBtn">Edit Btn</button>
        `);
    }

    function printMovieCard(div, movie) {
        div.append(`
                <div class="divCard col-3" data-movie-id="${movie.id}">
                    <div class="card">
                        <a role="button" href="#singleMovieModal" data-bs-toggle="modal">
                            <img src=${movie.poster} class="card-img all-movie-img">
                        </a>
                    </div>
                </div>
            `);
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
        console.log(movieList.results[0]);
        movieList.results.forEach((movie, index) => {
            if(index < 6) {
                $("#moviesList").append(`
                    <div class="col-2">
                        <div class="card" data-movie-id="${movie.id}" style="height: 240px;">
                            <img src="https://image.tmdb.org/t/p/original/${movie.poster_path}" class="card-img">
                        </div>
                    </div>
                `);
            }
        });
        addMovieModal.handleUpdate();
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
        $("#modalCloseBtn").trigger("click");
    });

    $(document.body).on("click", ".deleteBtn", function (){
        deleteMovie($(this).parent().attr("data-movie-id"))
        $("#singleModalCloseBtn").trigger("click");
    })
    $(document.body).on("click", ".editBtn", function (e){
        e.preventDefault()
        editMovie($(this).parent().attr("data-movie-id"))
    })

    $("#addMovieBtn").on("click", function() {
        setTimeout(function() {
            $("#addMovieText").focus();
        }, 500)
    });

    $(document.body).on("click", ".all-movie-img", function() {
        getMovieInfo($(this).parent().parent().parent().attr("data-movie-id"))
            .then(res => {
                console.log(res);
                printSingleMovieModal($("#singleMovieModal"), res);
            });
    });
});