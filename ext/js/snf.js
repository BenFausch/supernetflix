//TODO:
//handle empty returns from all api queries
//api key
// console.log('test')

// theMovieDb.common.api_key = "117df4e7395c65b9ea3b70a9a3f5a3f5";
//search for movies by title
function movieSearch(query, that) {
    let title = encodeURIComponent(query);
    console.log(title)
    let movieId = '';
    theMovieDb.search.getMovie({
        "query": title
    }, function(data) {
        data = JSON.parse(data)
        let id = data.results[0].id;
        console.log('id is ' + id)
        getMovieTrailer(id)
        getMovieById(id, that)
        // getOMDB(id)
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

function getMovieTrailer(movieId) {
    theMovieDb.movies.getTrailers({
        "id": movieId
    }, function(data) {
        console.log(data)
        data = JSON.parse(data)
        let youtube = data.youtube[0].source
        console.log(youtube)

        $('.jawBoneContent.open .jawbone-overview-info .listMeta').after('<p class="snf-trailer" id="' + youtube + '"><a href="https://www.youtube.com/watch?v='+youtube+'" target="_blank">Official Trailer</a></button>')
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

        data.Ratings.forEach(function(rating) {
            $('.jawBoneContent.open .jawbone-overview-info .listMeta').unbind().after('<p class="snf-ratings">' + rating.Source + ' : <span>' + rating.Value + '</span></p>')
        })
    })
}


function closeModal(){
    console.log('close')
            $('#snf-container').empty()
            $('.snf-ratings').remove()
            $('.snf-trailer').remove()
}

$(document).ready(function() {
    //on hover over title card
    $('.slider-item').unbind().on('mouseenter', function() {
        console.log('title card')
        let title = $(this).find('.video-preload-title-label').text().trim();
        closeModal()
        $(this).next('.jawBoneContent.open').css('border','3px sold green')
        
        let movieId = movieSearch(title, this)
        // $(this).find('.title-card span').unbind().on('click', function() {
        //     closeModal()
        //     console.log('clicked ' + title)
        //     let movieId = movieSearch(title)
        // });
        $('.close-button').unbind().on('click', function() {
            closeModal()
        });
    })
        // $('.slider-item').unbind().on('mouseleave', function() {
        //     closeModal()
        // })
    //end doc ready
});