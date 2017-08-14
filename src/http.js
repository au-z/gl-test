function get(url, responseType) {
	return new Promise((resolve, reject) => {
		const http = new XMLHttpRequest()
		http.responseType = responseType || 'text'
		http.open('GET', url)
		http.onload = function() {
			if(http.status === 200) {
				resolve(http.response)
			}else{
				reject(Error(http.statusText))
			}
		}
		http.onerror = function() {
			reject(Error('Network error.'))
		}
		http.send()
	})
}

export {
	get,
}
