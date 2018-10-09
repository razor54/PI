module.exports = Actor;

function Actor(actor,roles){

	this.name = actor.name;
	this.birthday = actor.birthday;
	this.gender = gender[actor.gender];
	this.biography = actor.biography;
	this.roles = roles.cast;
	this.profile_image = actor.profile_path;
	
}

const gender = {
	0: "Female",
	2: "Male"
};