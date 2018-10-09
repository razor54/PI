module.exports = ApiInfo


function ApiInfo(){

    this.workers = [
        new Worker('André Gaudêncio',42204),
        new Worker('Nuno Conceição',42195),
        new Worker('Guilherme Arede',41548)
    ]

    this.welcomeMessage = 'Insert movie here:'
    
}

function Worker(name,number){
    this.name=name
    this.number=number
}