
function reply(id) {

    var e = document.getElementById(id);
    e.style.display = ((e.style.display != 'none') ? 'none' : 'block');

}


var lastScrollPosition = 0;


function loadComments(movieTitle, movieId) {
    const commentsView = document.getElementById("commentsHere")

    if(lastScrollPosition != window.scrollY)
    if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) {
       

        const dbMovieId = `${movieId}%20${movieTitle}`

        const dataBaseUri = `/movie/${movieId}/comment/${dbMovieId}`

        httpRequest("GET", dataBaseUri, null, (err, data) => {
            commentsView.innerHTML = data

        })
    }
    lastScrollPosition = window.scrollY
}


function httpRequest(method, path, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, path, true)

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () { //Call a function when the state changes.
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200)
                cb(null, xhr.responseText)
            else
                cb(new Error(xhr.status + ': ' + xhr.responseText))
        }
    }
    xhr.send(data);
}
