var snfMovieSearch = {
    movieSearch: function(query, year) {
        let title = encodeURIComponent(query);
        let movieId = '';
        theMovieDb.search.getMovie({
            "query": title,
            "year": year
        }, function(data) {


            data = JSON.parse(data)
            if (typeof data.results[0] !== 'undefined') {
                let id = data.results[0].id;
                // snfMovieSearch.closeModal()
                snfMovieSearch.getMovieTrailer(id)
                snfMovieSearch.getMovieById(id)
            } else {
                // snfMovieSearch.closeModal()
                snfMovieSearch.tvSearch(title)
            }
        }, function(error) {})
    },
    getMovieById: function(id) {
        theMovieDb.movies.getById({
            "id": id
        }, function(data) {
            data = JSON.parse(data)
            if (data.imdb_id) {
                snfMovieSearch.getOMDB(data.imdb_id, data.title, data.release_date)
            }
        }, function(error) {})
    },
    getTvById: function(id) {
        theMovieDb.tv.getById({
            "id": id
        }, function(data) {
            data = JSON.parse(data)
            // $('#snf-container').append('<p class="snf-trailer"><a href="' + data.homepage + '" target="_blank">Show Homepage</a></button>')

            $('#snf-container').append('<p class="snf-ratings"><span>' + data.vote_average + '/10</span> TMDB</p>')
            $('.snf-ratings, .snf-ratings *').hide().fadeIn(600)
        }, function(error) {})
    },
    tvSearch: function(query, year) {
        theMovieDb.search.getTv({
            "query": query,
            "first_air_date_year": year
        }, function(data) {
            data = JSON.parse(data)
            if (data.total_results > 0) {
                snfMovieSearch.getTvById(data.results[0].id)
            } else {
                snfMovieSearch.searchOMDB(query);
            }
        }, function(error) {})
    },
    getMovieTrailer: function(movieId) {
        theMovieDb.movies.getTrailers({
            "id": movieId
        }, function(data) {
            data = JSON.parse(data)
            if (data.youtube[0]) {
                let youtube = data.youtube[0].source
                if ($('.snf-trailer').length > 0) {
                    $('.snf-trailer').remove()
                }
                $('#snf-container').append('<p class="snf-trailer" id="' + youtube + '"><a href="https://www.youtube.com/watch?v=' + youtube + '" target="_blank">Official<br>Trailer</a></button>')
                $('.snf-trailer, .snf-trailer *').hide().fadeIn(600)
            }
        }, function(error) {})
    },
    getOMDB: function(imdb, title, date) {
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
                $('#snf-container').append('<p class="snf-ratings" id="omdb-title"><span>' + rating.Value + '</span>' + snfMovieSearch.shortenReview(rating.Source)+'</p>')

            })
            $('.snf-ratings, .snf-ratings *').hide().fadeIn(600)
        })
    },
    searchOMDB: function(title) {
        let omdb = 'https://www.omdbapi.com/?t=' + title + '&apikey=f74062e1'
        $.get(omdb).then(function(data) {
            if (data.Response === 'True') {
                data.Ratings.forEach(function(rating) {
                    $('#snf-container').append('<p class="snf-ratings" id="omdb-search"><span>' + rating.Value + '</span>' + snfMovieSearch.shortenReview(rating.Source)+'</p>')
                })
                        $('.snf-ratings, .snf-ratings *').hide().fadeIn(600)
            }
        })
    },
    shortenReview:function (name){
        switch (name){
            case 'Internet Movie Database':
            return 'IMDB';
            case 'Rotten Tomatoes':
            return 'RT';
            case 'Metacritic':
            return 'MC';
            default: 
            return name;
        }
    },
    closeModal: function() {
        $('.snf-ratings').remove()
        $('.snf-trailer').remove()
        $('#snf-container').remove()
    },
    searchQuery: function(title) {
        setTimeout(function() {
            openTitle = $('.jawBoneFadeInPlaceContainer').find('.text').text();
            openTitle.length < 1 ? openTitle = $('.jawBoneFadeInPlaceContainer').find('.logo').attr('alt') : openTitle;
            openTitle = openTitle.replace(/ *\([^)]*\) */g, "")
            if (title === openTitle) {
                console.log('SEARCHING FOR ' + title.toUpperCase())
                let year = $(".jawBoneFadeInPlaceContainer").find('.year').text();
                let rating = $(".jawBoneFadeInPlaceContainer").find('.maturity-number').text();
                snfMovieSearch.closeModal()
                $(".jawBoneFadeInPlaceContainer").unbind().find('.synopsis').after('<div id="snf-container"></>')
                
                if (rating.indexOf('TV') < 0) {
                    snfMovieSearch.movieSearch(title, year);
                } else {
                    snfMovieSearch.tvSearch(title, year)
                }
            }
        }, 2000);
    },
    init: function() {
        let title = '';
        let openTitle = '';
        $(document).on('mouseenter', '.boxart-image', function() {
            let newTitle = $(this).next('.fallback-text-container').children('div.fallback-text').text();
            newTitle = newTitle.replace(/ *\([^)]*\) */g, "")
            console.log('title is ' + title + ' , newTitle is ' + newTitle)
            if (newTitle !== title) {
                title = newTitle;
                try {
                    snfMovieSearch.searchQuery(title);
                } catch (e) {}
                $('.title-card span').unbind().on('click', function() {
                    snfMovieSearch.searchQuery(title);
                });
            }
        })
    },
}
$(document).ready(function() {
    snfMovieSearch.init();
});