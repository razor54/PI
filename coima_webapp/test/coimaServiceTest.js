"use strict";

const fs = require("fs");

module.exports = {
	testGetSearch,
	testGetActor,
	testCache,
	testMovie86,
	testRegex
};


const endpoints = {
	"https://api.themoviedb.org/3/search/movie?api_key=8ccbfaaab52d4b5a42a3a5be4971fc18&query=ronaldo&page=1": 
				fs.readFileSync("./test/coima_JSON/movieList_ronaldo.json").toString(),
	"https://api.themoviedb.org/3/person/123?api_key=8ccbfaaab52d4b5a42a3a5be4971fc18": 
				fs.readFileSync("./test/coima_JSON/actorDetails_123.json").toString(),
	"https://api.themoviedb.org/3/person/123/movie_credits?api_key=8ccbfaaab52d4b5a42a3a5be4971fc18": 
				fs.readFileSync("./test/coima_JSON/actorDetails_123_roles.json").toString(),
	"https://api.themoviedb.org/3/movie/86?api_key=8ccbfaaab52d4b5a42a3a5be4971fc18":
				fs.readFileSync("./test/coima_JSON/movieDetail_86.json").toString(),
	"https://api.themoviedb.org/3/movie/86/credits?api_key=8ccbfaaab52d4b5a42a3a5be4971fc18":	
				fs.readFileSync("./test/coima_JSON/movieCredits_86.json").toString()	
};

const coima = require("./../services/coimaService")(reqToFile);

let request_counter = 0;

function reqToFile(path, cb) {
	request_counter+=1;
	const data = endpoints[path];
	if(!data) return cb(new Error("No mock file for path " + path));
	cb(null, null, data);
}


function testGetSearch(test) {
	coima.getSearch("ronaldo",1, (err, movieList ) => {
		if(err) 
			test.ifError(err);
		else {
			test.equal(movieList.page, 1);
			test.equal(movieList.total_results, 9);
			test.equal(movieList.total_pages, 1);
		}
		test.done();
	});
}

function testMovie86(test){

	coima.getMovie(86, (err, movie) => {

		if(err)
			test.ifError(err);

		else {
			test.equal(movie.id,86);
			test.equal(movie.title,"Elementarteilchen");
			test.equal(movie.director, "Oskar Roehler");
		}
		test.done();
	});

}


function testGetActor(test) {
	coima.getActor(123, (err, actor) => {
		if(err) 
			test.ifError(err);
		else {
			test.equal(actor.name,"Barrie M. Osborne");
			test.equal(actor.birthday, "1944-02-07");
			test.equal(actor.gender, "Male");
			test.equal(actor.biography, "");
			test.equal(actor.roles[0].character,"Himself");
		}
		test.done();
	});
}


function testCache(test){

	actorGetter(test);

	let count = request_counter;
	
	actorGetter(test);

	test.equal(count,request_counter);

	test.done();
}


function actorGetter(test){

	coima.getActor(123, (err, actor) => {
		if(err) 
			test.ifError(err);
		else {
			test.equal(actor.name,"Barrie M. Osborne");
			test.equal(actor.birthday, "1944-02-07");
			test.equal(actor.gender, "Male");
			test.equal(actor.biography, "");
			test.equal(actor.roles[0].character,"Himself");
		}
		
	});
}

function testRegex (test){

	const pattern =/actor\//;
	const page=/^[0-9]+$/;
	let isPattern = pattern.test("actor/");

	test.equal(isPattern,true);
	
	isPattern= page.test("1212");
	test.equal(isPattern,true);
	
	const pat =/^\d[0-9]$/;

	test.equal(pat.test("12"),true);

	const finalPattern = /^\/actor\/[0-9]+$/;

	test.equal(finalPattern.test("/actor/5"),true);

	test.equal(finalPattern.test("/actor/5as"),false);

	const searchPattern = /^\/search\?name=[A-Za-z+0-9]+$/;

	test.equal(searchPattern.test("/search?name=asas12+as"),true);

	const blankPattern = /^\/$/;
	
	test.equal(blankPattern.test("/"),true);

	test.done();

}