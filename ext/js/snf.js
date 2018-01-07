function movieSearch(query, year) {
    let title = encodeURIComponent(query);
    let movieId = '';
    theMovieDb.search.getMovie({
        "query": title,
        "year": year
    }, function(data) {
        data = JSON.parse(data)
        if (typeof data.results[0] !== 'undefined') {
            let id = data.results[0].id;
            closeModal()
            getMovieTrailer(id)
            getMovieById(id)
        } else {
            closeModal()
            tvSearch(title)
        }
    }, function(error) {})
}

function getMovieById(id) {
    theMovieDb.movies.getById({
        "id": id
    }, function(data) {
        data = JSON.parse(data)
        if (data.imdb_id) {
            getOMDB(data.imdb_id, data.title, data.release_date)
        }
    }, function(error) {})
}

function getTvById(id) {
    theMovieDb.tv.getById({
        "id": id
    }, function(data) {
        data = JSON.parse(data)
        $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-trailer"><a href="' + data.homepage + '" target="_blank">Show Homepage</a></button>')
        $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').unbind().after('<p class="snf-ratings">TheMovieDatabase : <span>' + data.vote_average + '/10</span></p>')
    }, function(error) {
        
    })
}

function tvSearch(query, year) {
    theMovieDb.search.getTv({
        "query": query,
        "first_air_date_year": year
    }, function(data) {
        data = JSON.parse(data)
        if (data.total_results > 0) {
            getTvById(data.results[0].id)
        } else {
            searchOMDB(query);
        }
    }, function(error) {})
}

function getMovieTrailer(movieId) {
    theMovieDb.movies.getTrailers({
        "id": movieId
    }, function(data) {
        data = JSON.parse(data)
        if (data.youtube[0]) {
            let youtube = data.youtube[0].source
            if ($('.snf-trailer').length > 0) {
                $('.snf-trailer').remove()
            }
            $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-trailer" id="' + youtube + '"><a href="https://www.youtube.com/watch?v=' + youtube + '" target="_blank">Official Trailer</a></button>')
        }
    }, function(error) {})
}

function getOMDB(imdb, title, date) {
    let omdb = '';
    if (imdb.length < 1) {
        date = date.substr(0, 4)
        omdb = 'https://www.omdbapi.com/?t=' + encodeURIComponent(title) + '&y=' + date + '&apikey=f74062e1'
    } else {
        omdb = 'https://www.omdbapi.com/?i=' + imdb + '&apikey=f74062e1'
    }
    $.get(omdb).then(function(data) {
        if ($('.snf-ratings').length > 0) {
            $('.snf-ratings').remove()
        }
        data.Ratings.forEach(function(rating) {
            $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-ratings" id="omdb-title">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
        })
    })
}

function searchOMDB(title) {
    let omdb = 'https://www.omdbapi.com/?t=' + title + '&apikey=f74062e1'
    $.get(omdb).then(function(data) {
        if (data.Response === 'True') {
            data.Ratings.forEach(function(rating) {
                $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<p class="snf-ratings" id="omdb-search">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
            })
        }
    })
}

function closeModal() {
    $('.snf-ratings').remove()
    $('.snf-trailer').remove()
}

function searchQuery(title) {
    setTimeout(function() {
        let year = $(".jawBoneFadeInPlaceContainer").find('.year').text();
        let rating = $(".jawBoneFadeInPlaceContainer").find('.maturity-number').text();
        if (rating.indexOf('TV') < 0) {
            movieSearch(title, year);
        } else {
            tvSearch(title, year)
        }
    }, 1500);
}

function initial() {
    let title = '';
    $(document).on('mouseenter', '.lazy-background-image', function() {
        let newTitle = $(this).closest('.slider-item').find('.video-preload-title-label').text();
        newTitle = newTitle.replace(/ *\([^)]*\) */g, "").replace(/[^A-Z0-9]/ig, "-").replace('--', '-');
        if (newTitle !== title) {
            title = newTitle;
            console.log('SEARCHING FOR ' + title.toUpperCase())
            try {
                searchQuery(title);
            } catch (e) {}
            $('.title-card span').unbind().on('click', function() {
                searchQuery(title);
            });
        }
    })
}
$(document).ready(function() {
    initial();
});