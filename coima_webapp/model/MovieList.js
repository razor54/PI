module.exports = MovieList;

function MovieList(list){
	this.page = list.page;
	this.results = list.results;
	this.total_results = list.total_results;
	this.total_pages = list.total_pages;
	this.previous_page = this.page-1 > 0 ? this.page-1 : null;
	this.next_page = (this.total_pages > this.page)? this.page + 1 : null;
}