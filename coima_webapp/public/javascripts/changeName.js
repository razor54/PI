function changeName(id) {

    const newname = document.getElementById("newName")
    const val = $(newname).val()
    const dataBaseUri = `/renameList/${id}/${val}`

    httpRequest("PUT", dataBaseUri, null, (err, data) => {

        const updatedName = document.getElementById(id+"-name")
        updatedName.innerHTML = val

    })
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