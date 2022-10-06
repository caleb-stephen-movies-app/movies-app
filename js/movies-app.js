$(function() {

    // MovieApp Object and Methods
    const MovieApp = {
        GlobalURLs: {
            // Storing all the URL const variablers
            moviesURL: "https://liberating-military-cyclone.glitch.me/movies",
            searchTMDBURL: "https://api.themoviedb.org/3/search/movie",
            findTMDBURL: "https://api.themoviedb.org/3/movie/"
        },
        initialize() {
            // Prints current movie database on screen and initializes all event listeners
            Print.allMovies(Get.allMovies());
            Events.initialize();
        }
    }
    // Get Object and Methods
    const Get = {
        async allMovies() {
            // Gets all movies from our database
            try {
                let response = await fetch(MovieApp.GlobalURLs.moviesURL);
                let data = await response.json();
                return data;
            } catch (err) {
                console.log(err);
            }
        },
        async singleMovie(id) {
            // finding all movie data needed for our database with TMDB id
            let movieData = await Get.tmbdMovieById(id).then(results => results);
            let movieToAdd = {
                title: movieData.title,
                poster: `https://image.tmdb.org/t/p/original/${movieData.poster_path}`,
                year: movieData.release_date.substring(0,4),
                genre: Utils.Convert.genreArrayToString(movieData.genres),
                plot: movieData.overview
            }
            // returns movie object that matches the information stored in our project
            return movieToAdd;
        },
        async movieById(id) {
            // finds and returns movie data for movie in our database
            let allMoviesData = await this.allMovies();
            for(let movie of allMoviesData) {
                if(movie.id === parseInt(id)) {
                    return movie;
                }
            }
        },
        async tmbdMovieById(id) {
            // finds movie from TMDB database
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
        async movieByTitle(title) {
            // finds movies from TMDB database
            // inputs string with movie title
            // returns data array inside a promise
            try {
                let response = await fetch(`${MovieApp.GlobalURLs.searchTMDBURL}${TMDB_KEY}&query=${title}&include_adult=false`);
                let data = await response.json();
                return data;
            } catch(err) {
                console.log(err);
            }
        }
    }
    // Print Object and Methods
    const Print = {
        async allMovies(dataPromise) {
            // prints all movies in our database on screen
            const cardDiv = $("#cardsDiv");
            cardDiv.empty();
            dataPromise.then(movieData => {
                movieData.forEach((movie) => {
                    Print.singleMovie(cardDiv, movie);
                });
            });
        },
        async singleMovie(div, movie) {
            // prints single movie card from our database to be inserted into the all movies list
            div.append(`
                <div class="divCard col-3" data-movie-id="${movie.id}">
                    <div class="card" style="border-radius: 2em; overflow: hidden;">
                        <a role="button" href="#singleMovieModal" data-bs-toggle="modal">
                            <img src=${movie.poster} class="card-img all-movie-img" style="height: 429px;">
                        </a>
                    </div>
                </div>
            `);
        },
        async movieModal(div, movie) {
            // prints the movie modal from our database
            // contains movie info with no image
            let modalHeaderDiv = $("#singleMovieModalHeader");
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
             <div class="d-flex justify-content-between" style="width: 100%;">
                 <button class="editBtn btn btn-primary">Edit Movie</button>
                 <button class="deleteBtn btn btn-danger">Delete Movie</button>
             </div>
        `);
        },
        async editModal(movie) {
            // prints the movie modal from our database
            // contains movie info with no image
            let modalHeaderDiv = $("#singleMovieModalHeader");
            let modalBodyDiv = $("#singleMovie");
            modalHeaderDiv.empty();
            modalHeaderDiv.append(`
                <input class="modal-title text-light" value="${movie.title}"></input>
                <button id="modalCloseBtn" type="button" class="btn-close" data-bs-dismiss="modal"></button>
            `);
            modalBodyDiv.empty();
            modalBodyDiv.attr("data-movie-id", movie.id);
            modalBodyDiv.append(`
            <label>
             <input value="${movie.genre}">
            </label> 
             <input value="${movie.plot}">
             <input value="${movie.year}">
             <div class="d-flex justify-content-between" style="width: 100%;">
                 <button class="editBtn btn btn-primary">Edit Movie</button>
                 <button class="deleteBtn btn btn-danger">Delete Movie</button>
             </div>
        `);
        },
        async moviesList(title) {
            // prints modal with movies from TMDB database
            // shows the top 6 from search results
            let movieList = await Get.movieByTitle(title).then(results => results);
            $("#moviesList").empty();
            movieList.results.forEach((movie, index) => {
                if(index < 6) {
                    $("#moviesList").append(`
                    <div class="col-2">
                        <div class="card" data-movie-id="${movie.id}" style="height: 240px;">
                            <img src="https://image.tmdb.org/t/p/original/${movie.poster_path}" class="card-img" style="height: 240px;">
                        </div>
                    </div>
                `);
                }
            });
        },
        addMovie(movie) {
            $("#cardsDiv").prepend(`
                <div class="divCard col-3" data-movie-id="${movie.id}">
                    <div class="card" style="border-radius: 2em; overflow: hidden;">
                        <a role="button" href="#singleMovieModal" data-bs-toggle="modal">
                            <img src=${movie.poster} class="card-img all-movie-img" style="height: 429px;">
                        </a>
                    </div>
                </div>
            `);
        }
    }
    // User Object and Methods
    const User = {
        async addMovie(id) {

            let movie = await Get.singleMovie(id)
            const postOptions = {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(movie)
            }

            fetch(MovieApp.GlobalURLs.moviesURL, postOptions).then(() => {
                // clear text box
                $("#addMovieText").val('');
                // clear movies list
                $("#moviesList").empty();
                // reprint all movies
                Print.addMovie(movie);
            });
        },
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
        async editMovie(id) {
            let editOptions = {
                method: 'PATCH',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(editOptions)
            }
            Print.editModal()
            // Reprint modal to have a form instead of just the information


            // add a new event listener for when the user is ready to complete the edit


            // change the database with the new edit information


        }
    }
    // Utilities Object and Methods
    const Utils = {
        Convert: {
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
        Hide: {
            modal(modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
        }

    }
    // Events Object and Methods
    const Events = {
        initialize() {
            // update movieList on space and enter
            $("#addMovieText").keyup(e => {
                if(e.key === "Enter" || e.key === " "){
                    Print.moviesList($("#addMovieText").val());
                }
            });

            // update movieList on keyup
            // $("#addMovieText").keyup(e => {
            //     populateMoviesList($("#addMovieText").val())
            // });

            $(document.body).on("click", "#moviesList .card", function() {
                console.log("User added a movie");
                User.addMovie($(this).attr("data-movie-id"));
                Utils.Hide.modal($("#addMovieModal"));
            });

            $(document.body).on("click", ".deleteBtn", function (){
                $(this).attr("disabled", "");
                User.deleteMovie($(this).parent().parent().attr("data-movie-id"), $(this));
                Utils.Hide.modal($("#singleMovieModal"));
            })
            $(document.body).on("click", ".editBtn", function (){
                $(this).attr("disabled", "");
                User.editMovie($(this).parent().parent().attr("data-movie-id"));
            })

            $("#addMovieBtn").on("click", function() {
                setTimeout(function() {
                    $("#addMovieText").focus();
                }, 500);
            });

            $(document.body).on("click", ".all-movie-img", function() {
                console.log($(this).parent().parent().parent().attr("data-movie-id"));
                Get.movieById($(this).parent().parent().parent().attr("data-movie-id"))
                    .then(res => Print.movieModal($("#singleMovieModal"), res));
            });
        },
    }

    // Initialize MovieApp
    MovieApp.initialize();
});