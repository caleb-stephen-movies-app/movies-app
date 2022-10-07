$(function() {

    // MovieApp Object and Methods
    const MovieApp = {
        // Storing all the URL const variablers
        GlobalURLs: {
            moviesURL: "https://liberating-military-cyclone.glitch.me/movies",
            searchTMDBURL: "https://api.themoviedb.org/3/search/movie",
            findTMDBURL: "https://api.themoviedb.org/3/movie/"
        },
        // Paths for NSFW search results from TMDB
        TMDBPaths: {
            sfw: "&include_adult=false",
            nsfw: "&include_adult=true"
        },
        // Prints current movie database on screen and initializes all event listeners
        initialize() {
            // setTimeout just to show the loading screen for more than a split second. It can be removed for production
            // setTimeout(() => {
                Print.allMovies(Get.allMovies());
            // }, 5000);
            Events.initialize();
        },
        // String that holds user input for secret code
        hiddenString: "",
        // Function to change TMDB search to allow adult results
        enterBackRoom() {
            User.overEighteen = true;
            // Changes background of page to represent that the user is in NSFW mode
            $("#page-wrapper").toggleClass("normal-bg back-room-bg");
            // Setting back room timer to 30 seconds
            let backRoomTimer = 30;
            $("#back-room-timer").html(`0.${backRoomTimer.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`);
            // Decrementing timer every second
            let intervalId = setInterval(() => {
                backRoomTimer--;
                $("#back-room-timer").html(`0.${backRoomTimer.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`);
            }, 1000);
            // After 30 seconds runs function to turn off NSFW mode
            setTimeout(() => {
                MovieApp.leaveBackRoom()
                clearInterval(intervalId);
            }, 30000);
        },
        // Sets TMDB search back to SFW
        leaveBackRoom() {
            User.overEighteen = false;
            $("#page-wrapper").toggleClass("normal-bg back-room-bg");
            $("#back-room-timer").html("");
        }
    }
    // Get Object and Methods
    const Get = {
        // Gets all movies from our database
        async allMovies() {
            try {
                let response = await fetch(MovieApp.GlobalURLs.moviesURL);
                let data = await response.json();
                return data;
            } catch (err) {
                console.log(err);
            }
        },
        // Gets only the data we need for our database from the TMDB database from the TMDB id input
        async scrapeSingleMovieData(tmdbId) {
            // Receives the full TMDB data
            let movieData = await Get.tmbdMovieById(tmdbId);
            // Scrapes necessary movie data
            let movieToAdd = {
                title: movieData.title,
                poster: `https://image.tmdb.org/t/p/original/${movieData.poster_path}`,
                year: movieData.release_date.substring(0,4),
                genre: Utils.Convert.genreArrayToString(movieData.genres),
                plot: movieData.overview,
                tmdbId: movieData.id
            }
            // returns movie object that matches the information stored in our project
            return movieToAdd;
        },
        // finds and returns movie data for movie in our database
        async movieById(id) {
            let allMoviesData = await this.allMovies();
            for(let movie of allMoviesData) {
                if(movie.id === parseInt(id)) {
                    return movie;
                }
            }
        },
        // finds movie from TMDB database
        async tmbdMovieById(id) {
            // uses TMDB id
            // returns data inside a promise
            try {
                let response = await fetch(`${MovieApp.GlobalURLs.findTMDBURL}${id}${TMDB_KEY}`);
                let data = await response.json();
                return data;
            } catch(err) {
                console.log(err);
            }
        },
        // finds movies from TMDB database
        async movieByTitle(title) {
            // inputs string with movie title
            // returns data array inside a promise
            try {
                let response = await fetch(`${MovieApp.GlobalURLs.searchTMDBURL}${TMDB_KEY}&query=${title}${User.overEighteen? MovieApp.TMDBPaths.nsfw : MovieApp.TMDBPaths.sfw}`);
                let data = await response.json();
                return data;
            } catch(err) {
                console.log(err);
            }
        }
    }
    // Print Object and Methods
    const Print = {
        // Prints all movies onto screen
        async allMovies(dataPromise) {
            $("#loading-div").removeClass("d-none");
            // prints all movies in our database on screen
            const cardDiv = $("#cards-div");
            cardDiv.empty();
            dataPromise.then(movieData => {
                User.sortMovies(movieData).forEach((movie) => {
                    Print.singleMovie(cardDiv, movie);
                });
                $("#loading-div").addClass("d-none");
            });
        },
        // prints single movie card from our database to be inserted into the all movies list
        async singleMovie(div, movie) {
            div.prepend(`
                <div class="div-card col-3" data-movie-id="${movie.id}">
                    <div class="card movie-card">
                        <a role="button" href="#single-movie-modal" data-bs-toggle="modal">
                            <img src=${movie.poster} class="card-img all-movie-img">
                        </a>
                    </div>
                </div>
            `);
        },
        // prints the movie modal from our database
        async movieModal(div, movie) {
            // contains movie info with no image
            let modalHeaderDiv = $("#single-movie-modal-header");
            let modalBodyDiv = $("#single-movie");
            modalHeaderDiv.empty();
            modalHeaderDiv.append(`
                <h5 class="modal-title text-light">${movie.title}</h5>
            `);
            modalBodyDiv.empty();
            modalBodyDiv.attr("data-movie-id", movie.id);
            modalBodyDiv.append(`
             <p>Genre: ${movie.genre}</p>
             <p>Plot :${movie.plot}</p>
             <p>Year: ${movie.year}</p>
             <div class="d-flex justify-content-between">
                 <button class="edit-btn btn btn-primary">Edit Movie</button>
                 <button class="delete-btn btn btn-danger">Delete Movie</button>
             </div>
        `);
        },
        // Prints movie modal from our database with text fields for user to edit
        async editModal(movie) {
            // prints the movie modal from our database
            // contains movie info with no image
            let modalHeaderDiv = $("#single-movie-modal-header");
            let modalBodyDiv = $("#single-movie");
            modalHeaderDiv.empty();
            modalHeaderDiv.append(`
                <input id="title-input" class="w-100 modal-input border-dark bg-light" type="text" value="${movie.title}">
            `);
            modalBodyDiv.empty();
            modalBodyDiv.attr("data-movie-id", movie.id);
            modalBodyDiv.append(`
                 <input id="genre-input" class="modal-input border-dark bg-light" value="${movie.genre}">
                 <textarea id="plot-input" class="w-100 modal-input border-dark bg-light" rows="9">${movie.plot}</textarea>
                 <input id="year-input" class="modal-input border-dark bg-light" value="${movie.year}">
                 <div class="d-flex justify-content-center">
                     <button id="save-edit-btn" class="btn btn-primary mt-3">Save Edit</button>
                 </div>
            `);
        },
        // prints modal with movies from TMDB database
        async moviesList(title) {
            // shows the top 6 from search results
            let movieList = await Get.movieByTitle(title).then(results => results);
            $("#movie-list").empty();
            movieList.results.forEach((movie, index) => {
                if(index < 6) {
                    $("#movie-list").append(`
                    <div class="col-2">
                        <div class="card search-card" data-movie-tmdb-id="${movie.id}">
                            <img src="https://image.tmdb.org/t/p/original/${movie.poster_path}" class="card-img search-card-img">
                        </div>
                    </div>
                `);
                }
            });
        }
    }
    // User Object and Methods
    const User = {
        // Property to hold value to see if NSFW search is active
        overEighteen: false,
        // Adds movie to database
        async addMovie(tmdbId) {
            let movie = await Get.scrapeSingleMovieData(tmdbId);
            const postOptions = {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(movie)
            }
            fetch(MovieApp.GlobalURLs.moviesURL, postOptions).then(() => {
                $("#add-movie-text").val('');
                $("#movie-list").empty();
                // Print.addMovie(movie);
                Print.allMovies(Get.allMovies());
            });
        },
        // Deletes movie from database
        async deleteMovie(id, button) {
            let deleteOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type' : 'application/json'
                }
            }
            let deleteData = await fetch(`${MovieApp.GlobalURLs.moviesURL}/${id}`, deleteOptions).then(results => results);
            Print.allMovies(Get.allMovies());
            button.removeAttr("disabled");
        },
        // Edits movie in database
        async editMovie(id, button) {
            let newMovie = {
                title: $("#title-input").val(),
                genre: $("#genre-input").val(),
                plot: $("#plot-input").val(),
                year: $("#year-input").val()
            }

            let editOptions = {
                method: 'PATCH',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(newMovie)
            }

            let editData =await fetch(`${MovieApp.GlobalURLs.moviesURL}/${id}`, editOptions).then(results => results);

            Print.allMovies(Get.allMovies());
            button.removeAttr("disabled");
        },
        // Sorts movies based on user choice. returns new array of movies
        sortMovies(movies) {
            // Checks which value user selected and sorts
            switch($("#sort-select").children("option:selected").val()){
                case "1":
                    return movies;
                    break;
                case "2":
                    return movies.sort((prev, current) => prev.title.localeCompare(current.title)).reverse();
                    break;
                case "3":
                    return movies.sort((prev, current) => prev.title.localeCompare(current.title));
                    break;
                case "4":
                    return movies.sort((prev, current) => parseInt(prev.year) - parseInt(current.year));
                    break;
                case "5":
                    return movies.sort((prev, current) => parseInt(prev.year) - parseInt(current.year)).reverse();
                    break;
                default:
                    console.log("Unknown sort parameter");
                    return null;
                    break;
            }
        }
    }
    // Utilities Object and Methods
    const Utils = {
        // Convert methods
        Convert: {
            // Converts genre array to string to store in our database
            genreArrayToString(genreArray) {
                return genreArray.reduce((genresString, genre, index) => {
                    if(index === 0){
                        return genre.name;
                    } else {
                        return `${genresString}, ${genre.name}`
                    }
                }, '');
            }
        },
        // Hide methods
        Hide: {
            // Hides modal
            modal(modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
        }
    }
    // Events Object and Methods
    const Events = {
        // Initializes all event listeners
        initialize() {
            // Listens for keyup in the add movie text input
            $("#add-movie-text").keyup(e => {
                if(e.key === "Enter" || e.key === " "){
                    Print.moviesList($("#add-movie-text").val());
                }
            });
            // Listens for click on add movie card
            $(document.body).on("click", "#movie-list .card", function() {
                User.addMovie($(this).attr("data-movie-tmdb-id"));
                Utils.Hide.modal($("#add-movie-modal"));
            });
            // Listens for click on delete button
            $(document.body).on("click", ".delete-btn", function (){
                $(this).attr("disabled", "");
                User.deleteMovie($(this).parent().parent().attr("data-movie-id"), $(this));
                Utils.Hide.modal($("#single-movie-modal"));
            })
            // Listens for click of edit button
            $(document.body).on("click", ".edit-btn", function (){
                $(this).attr("disabled", "");
                Get.movieById($(this).parent().parent().attr("data-movie-id"))
                    .then(res => Print.editModal(res));
            })
            // Listens for click of add button
            $("#add-movie-btn").on("click", function() {
                $("#add-movie-text").val("").text("");
                $("#movie-list").html("");
                setTimeout(function() {
                    $("#add-movie-text").focus();
                }, 500);
            });
            // Listens for click of any image of our full movie list
            $(document.body).on("click", ".all-movie-img", function() {
                Get.movieById($(this).parent().parent().parent().attr("data-movie-id"))
                    .then(res => Print.movieModal($("#single-movie-modal"), res));
            });
            // Listens for click of the save edit button
            $(document.body).on("click", "#save-edit-btn", function() {
                User.editMovie($("#single-movie").attr("data-movie-id"));
                $(this).attr("disabled", "");
                Utils.Hide.modal($("#single-movie-modal"), $(this));
            });
            // Listens for any keyup on the screen
            $("body").on("keyup", function(e) {
                if(e.key === "Enter") {
                    MovieApp.hiddenString = "";
                } else {
                    MovieApp.hiddenString += e.key;
                }
                if(!User.overEighteen && MovieApp.hiddenString.toUpperCase().includes(BACK_ROOM)) {
                    MovieApp.enterBackRoom();
                }
            })
            // Listens for change in sort select
            $("#sort-select").change(function() {
                Print.allMovies(Get.allMovies());
            });
        }
    }

    // Initialize MovieApp
    MovieApp.initialize();
});