module.exports = Movie


function Movie(movie,credits){

    this.title = movie.original_title
    this.poster = movie.poster_path
    this.director = getDirector(credits.crew) /*TODO*/
    this.actors = credits.cast
    this.id = credits.id
}


function getDirector(crew){

    if(crew==undefined)return

    let directorArr = crew.filter((person)=>person.job=='Director')
    if(directorArr[0])
        return directorArr[0].name
	
}