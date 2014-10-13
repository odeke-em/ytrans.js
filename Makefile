test:
	./node_modules/.bin/mocha --reporter progress
local:
	mocha --reporter progress

.PHONY:	test
