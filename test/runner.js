const jest = require('jest')
const flags = process.argv.slice(2, process.argv.length)

flags.map((f) => {
	let arg = f.substr(1, f.length)
	switch(arg) {
		case 'u':
			process.env.TEST_MODE = 'update'
	}
})

jest.run()
