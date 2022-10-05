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
        let movieData = await moviesPromise;

    }


    // populating our allmoviespromise so that when we get the results it will have a JSON file with all the movies
    allMoviesPromise = getAllMovies();

    // calling function to print all the movies on screen
    printAllMovies(allMoviesPromise);

});