//TODO:
//handle empty returns from all api queries, handle tv shows
//search for movies by title
function movieSearch(query, year) {
    let title = encodeURIComponent(query);
    console.log(title)
    let movieId = '';
    theMovieDb.search.getMovie({
        "query": title,
        "year": year
    }, function(data) {
        data = JSON.parse(data)
        if (typeof data.results[0] !== 'undefined') {
            let id = data.results[0].id;
            console.log('id is ' + id)
            closeModal()
            console.log('year is ' + $('.year').text())
            getMovieTrailer(id)
            getMovieById(id)
        } else {
            console.log('moviesearchError, checking TV')
            closeModal()
            tvSearch(title)
        }
    }, function(error) {
        console.log(error)
    })
}

function getMovieById(id) {
    theMovieDb.movies.getById({
        "id": id
    }, function(data) {
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        getOMDB(data.imdb_id, data.title, data.release_date)
    }, function(error) {})
}

function getTvById(id) {
    theMovieDb.tv.getById({
        "id": id
    }, function(data) {
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        // getOMDB(data.imdb_id, data.title, data.release_date)
        $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-trailer"><a href="' + data.homepage + '" target="_blank">Show Homepage</a></button>')
        $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').unbind().after('<p class="snf-ratings">TheMovieDatabase : <span>' + data.vote_average + '</span></p>')
    }, function(error) {})
}

function tvSearch(query, year) {
    theMovieDb.search.getTv({
        "query": query,
        "first_air_date_year": year
    }, function(data) {
        console.log('searching tv for ' + query)
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        if (data.total_results > 0) {
            getTvById(data.results[0].id)
        } else {
            console.log('no moviedb results, searching OMDB')
            searchOMDB(query);
        }
        // 
    }, function(error) {})
}

function getMovieTrailer(movieId) {
    theMovieDb.movies.getTrailers({
        "id": movieId
    }, function(data) {
        console.log(data)
        data = JSON.parse(data)
        if (data.youtube[0]) {
            let youtube = data.youtube[0].source
            console.log(youtube)
            if ($('.snf-trailer').length > 0) {
                $('.snf-trailer').remove()
            }
            $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-trailer" id="' + youtube + '"><a href="https://www.youtube.com/watch?v=' + youtube + '" target="_blank">Official Trailer</a></button>')
        }
    }, function(error) {
        console.log(error)
    })
}

function getOMDB(imdb, title, date) {
    console.log('getOMDB' + imdb + title + date)
    let omdb = '';
    if (imdb.length < 1) {
        date = date.substr(0, 4)
        omdb = 'https://www.omdbapi.com/?t=' + encodeURIComponent(title) + '&y=' + date + '&apikey=f74062e1'
    } else {
        omdb = 'https://www.omdbapi.com/?i=' + imdb + '&apikey=f74062e1'
    }
    console.log(omdb)
    $.get(omdb).then(function(data) {
        console.log('omdb data')
        console.log(data)
        if ($('.snf-ratings').length > 0) {
            $('.snf-ratings').remove()
        }
        data.Ratings.forEach(function(rating) {
            $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-ratings">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
        })
    })
}

function searchOMDB(title) {
    let omdb = 'https://www.omdbapi.com/?t=' + title + '&apikey=f74062e1'
    $.get(omdb).then(function(data) {
        console.log(data)
        if (data.Response === 'True') {
            data.Ratings.forEach(function(rating) {
                console.log(rating)
                $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-ratings">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
            })
        }
    })
}

function closeModal() {
    console.log('close')
    $('.snf-ratings').remove()
    $('.snf-trailer').remove()
}

function searchQuery(title) {
    console.log('selected title: ' + title)
    setTimeout(function() {
        let year = $(".jawBoneFadeInPlaceContainer").find('.year').text();
        let rating = $(".jawBoneFadeInPlaceContainer").find('.maturity-number').text();
        console.log('rating: ' + rating)
        console.log('year: ' + year)
        if (rating.indexOf('TV') < 0) {
            movieSearch(title, year);
        } else {
            tvSearch(title, year)
        }
    }, 1500);
}
$(document).ready(function() {
    //on hover over title card
    $('.slider-item').unbind().on('mouseenter', function() {
        // console.log('title card')
        let title = $(this).find('.video-preload-title-label').text();
        title = title.replace(/ *\([^)]*\) */g, "").replace(/[^A-Z0-9]/ig, "-");
        console.log('title' + title);
        try {
            var result = document.getElementsByClassName("jawBoneFadeInPlaceContainer")[0].innerHTML;
            console.log('jawbone container:')
            console.log(result.length);
            searchQuery(title);
        } catch (e) {
            console.log('empty jawbone')
        }
        $('.title-card span').unbind().on('click', function() {
            searchQuery(title);
        });

        $(this).on('mouseleave', function(){
            $(this).unbind()
        })
    }).on('mouseleave', function() {
        // console.log('mouseleave')
        // $(this).unbind()
        // closeModal();
    });
    //end doc ready
});