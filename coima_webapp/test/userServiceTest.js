"use strict";

const fs = require("fs");
const dataStoreJsons = "./test/user_JSON";


module.exports = {
	testSaveNewUser//,
	//testGetUserList,
	//testAddMovieToList,
	////testAddList,
	//testRemoveList,
	//testRemoveListElem,
};


const endpoints = {
	'http://127.0.0.1:5984/g04pi/xpto': `${dataStoreJsons}/xpto.json`,
	'http://127.0.0.1:5984/g04pi/123': `${dataStoreJsons}/123.json`,
	'http://127.0.0.1:5984/g04pi/345': `${dataStoreJsons}/345.json`,
	'http://127.0.0.1:5984/g04pi/username': `${dataStoreJsons}/username.json`,
	'http://127.0.0.1:5984/g04pi/user': `${dataStoreJsons}/user.json`,
	'http://127.0.0.1:5984/g04pi/123456': `${dataStoreJsons}/123456.json`,
	'http://127.0.0.1:5984/g04pi/56789': `${dataStoreJsons}/56789.json`,
	'http://127.0.0.1:5984/g04pi/567890': `${dataStoreJsons}/567890.json`,
	'http://127.0.0.1:5984/g04pi/56789?rev=test56789': `${dataStoreJsons}/56789.json`
};


const userService = require("./../services/userService")(reqToFile);
const favService = require("./../services/favouritesService")(reqToFile);


function reqToFile(path, options, cb) {
	const file = endpoints[path.split("_"[0])];
	if (!file) 
		return cb(new Error("No mock file for path " + path));


	//REQUEST WITH PUT
	if (options.method == 'PUT') {
		fs.writeFile(file, options.body, (err) => {
			if (err) return cb(new Error("Error Writing to file" + path));
			cb();
		});
	}

	//REQUEST WITH GET
	if (options.method == 'GET') {
		fs.readFile(file, (err, data) => {
			if (err) return cb(new Error("Error Reading from file" + path));
			cb(null, null, data);
		});
	}

	//REQUEST WITH DELETE
	if (options.method == 'DELETE') {
		fs.unlink(file, (err) => {
			if (err) return cb(new Error("Error Deleting file" + path));
			cb();
		});
	}

}



function testSaveNewUser(test) {
	const user = {
		body: {
			name: "Xavier Pica Tiago Orlindo",
			username: "xpto",
			password: 123
		}
	};

	userService.saveNewUser(user, (err) => {

		if (err) {
			test.ifError(err);
			test.done();
		} else {
			fs.readFile(`${dataStoreJsons}/${user.body.username}.json`, (err, data) => {

				const userSaved = JSON.parse(data);
				test.equal(userSaved.name, user.body.name);
				test.equal(userSaved.username, user.body.username);
				test.equal(userSaved.password, user.body.password);

				fs.unlink(`${dataStoreJsons}/${user.body.username}.json`);
				test.done();
			});

		}


	});


}


function testGetUserList(test) {
	const id_path = 123;

	favService.getUserList("user", id_path, (err, data) => {

		if (err) {
			test.ifError(err);

		} else {
			test.equal(data.name, "myFavsTest");
			test.equal(data.movies[0].title, "Spider-Man: Homecoming");
			test.equal(data.movies[0].id, 315635);
			test.equal(data.movies[1].title, "Saw");
			test.equal(data.movies[1].id, 176);
		}
		test.done();
	});


}

function testAddMovieToList(test) {
	const id_path = 345;
	const movie = {
		title: "myMovie",
		id: 123213321
	};

	favService.addElementToList("user", id_path, movie, (err) => {

		if (err) {
			test.ifError(err);
		} else {
			fs.readFile(`${dataStoreJsons}/${id_path}.json`, (err, data) => {

				if (err) {
					test.ifError(err);
				} else {
					const list = JSON.parse(data);

					test.equal(list.movies[0].title, movie.title);
					test.equal(list.movies[0].id, movie.id);
				}

				//erase file movies
				const json = {
					_id: "345",
					_name: "myFavsTest2",
					movies: [],
					user:"user"
				}

				fs.writeFile(`${dataStoreJsons}/${id_path}.json`, JSON.stringify(json), () => {
					test.done();
				});

			});

		}


	});


}


function testAddList(test) {

	const user = {
		username: "username",
		password: "123",
		name: "username",
		favourites: []
	};
	const newList = "MyListFav3";
	const forcedID = 123456;


	favService.addList(user, newList,forcedID, (err) => {

		if (err) {
			test.ifError(err);
			test.done()
		} else {
			fs.readFile(`${dataStoreJsons}/${user.username}.json`, (err, data) => {

				if (err) {
					test.ifError(err);
				} else {
					const storedUser = JSON.parse(data);
					test.equal(storedUser.favourites.filter(e => e.name == newList)[0].name, newList);
				}

				fs.unlink(`${dataStoreJsons}/${user.username}.json`);

				fs.readFile(`${dataStoreJsons}/${forcedID}.json`, (err, data) => {

					if (err) {
						test.ifError(err);
					} else {
						const storedList = JSON.parse(data);
						test.equal(storedList.name, newList);
					}

					fs.unlink(`${dataStoreJsons}/${forcedID}.json`);

					test.done();

				});

			});
		}

	});


}

function testRemoveList(test) {

	const list = {
		id: 56789,
		_rev: "test56789",
		name: "test",
		movies: [],
		user:"user"
	};

	fs.writeFile(`${dataStoreJsons}/${list.id}.json`, JSON.stringify(list), (err) => {
		if (err) test.ifError(err)

		favService.removeList("user",list.id, (err) => {
			if (err) test.ifError(err)

			fs.readFile(`${dataStoreJsons}/${list.id}.json`, (err, data) => {
				test.equal(err.code, "ENOENT")
				test.done();
			})

		})

	})



}

function testRemoveListElem(test) {

	const list = {
		id: 567890,
		_rev: "test567890",
		name: "test1",
		id_path: 567890,
		movies: [{ name: 12, id: 25 }, { name: 13, id: 13 }, { name: 14, id: 15 }],
		user:"user"
	};

	fs.writeFile(`${dataStoreJsons}/${list.id}.json`, JSON.stringify(list), (err) => {
		if (err) test.ifError(err)

		favService.removeMovieFavourites("user",list.id_path, 25, (err) => {
			if (err) test.ifError(err)

			fs.readFile(`${dataStoreJsons}/${list.id}.json`, (err, data) => {

				const lis = JSON.parse(data)

				test.equal(lis.movies[0].id, list.movies[1].id)
				test.equal(lis.movies[1].id, list.movies[2].id)

				test.done();
			})

		})

	})

}