//TODO:
//handle empty returns from all api queries, handle tv shows
//search for movies by title
function movieSearch(query, that) {
     
    let title = encodeURIComponent(query);
    console.log(title)

    let movieId = '';
    theMovieDb.search.getMovie({
        "query": title
    }, function(data) {
        data = JSON.parse(data)
        if (typeof data.results[0] !== 'undefined') {
            let id = data.results[0].id;
            console.log('id is ' + id)
            closeModal()
            console.log('year is '+ $('.year').text())
            getMovieTrailer(id)
            getMovieById(id, that)
        } else {
            console.log('moviesearchError, checking TV')
            closeModal()
            tvSearch(title, that)
        }
    }, function(error) {
        console.log(error)
    })
}

function getMovieById(id, that) {
    theMovieDb.movies.getById({
        "id": id
    }, function(data) {
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        getOMDB(data.imdb_id, data.title, data.release_date, that)
    }, function(error) {})
}

function getTvById(id, that) {
    theMovieDb.tv.getById({
        "id": id
    }, function(data) {
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        // getOMDB(data.imdb_id, data.title, data.release_date, that)
        $('.jawBoneContent.open .jawbone-overview-info .listMeta').after('<p class="snf-trailer"><a href="' + data.homepage + '" target="_blank">Show Homepage</a></button>')
        $('.jawBoneContent.open .jawbone-overview-info .listMeta').unbind().after('<p class="snf-ratings">TheMovieDatabase : <span>' + data.vote_average + '</span></p>')
    }, function(error) {})
}

function tvSearch(query, that) {
    theMovieDb.search.getTv({
        "query": query
    }, function(data) {
        console.log('searching tv for ' + query)
        console.log(JSON.parse(data))
        data = JSON.parse(data)
        if (data.total_results > 0) {
            getTvById(data.results[0].id, that)
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
        if(data.youtube[0]){
                let youtube = data.youtube[0].source
                console.log(youtube)
                if ($('.snf-trailer').length > 0) {
                    $('.snf-trailer').remove()
                }
                $('.jawBoneContent.open .jawbone-overview-info .listMeta').after('<p class="snf-trailer" id="' + youtube + '"><a href="https://www.youtube.com/watch?v=' + youtube + '" target="_blank">Official Trailer</a></button>')
            }
    }, function(error) {
        console.log(error)
    })
}

function getOMDB(imdb, title, date, that) {
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
        console.log('current selector')
        console.log(that)
        if ($('.snf-ratings').length > 0) {
            $('.snf-ratings').remove()
        }
        data.Ratings.forEach(function(rating) {
            $('.jawBoneContent.open .jawbone-overview-info .listMeta').unbind().after('<p class="snf-ratings">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
        })
    })
}

function searchOMDB(title) {
    let omdb = 'https://www.omdbapi.com/?t=' + title + '&apikey=f74062e1'
    $.get(omdb).then(function(data) {
        console.log(data)
    })
}

function closeModal() {
    console.log('close')
    $('.snf-ratings').remove()
    $('.snf-trailer').remove()
}
$(document).ready(function() {
    //on hover over title card
    $('.slider-item').unbind().on('mouseenter', function() {
        console.log('title card')
        setTimeout(function() {
            var result = document.getElementsByClassName("jawBoneFadeInPlaceContainer")[0].innerHTML;
            console.log(result);
            console.log('tv rating: '+$(".jawBoneFadeInPlaceContainer").find('.maturity-number').text())
 
        },3000)
        let title = $(this).find('.video-preload-title-label').text();
        title = title.replace(/ *\([^)]*\) */g, "").replace(/[^A-Z0-9]/ig, "-");
        setTimeout(function() {
            movieSearch(title, this);
        }, 1500);
        $('.title-card span').unbind().on('click', function() {
            console.log('clicked ' + title)
            setTimeout(function() {
                movieSearch(title, this);
            }, 1500);
        });
        // $('.close-button').unbind().on('click', function() {
        //     closeModal()
        // });
    });
    // $('.slider-item').unbind().on('mouseleave', function() {
    //     closeModal()
    // })
    //end doc ready
});