test-nyan:
		./node_modules/.bin/mocha --reporter nyan specs/*.spec.* -c

test:
		./node_modules/.bin/mocha --reporter spec specs/*.spec.* -c

.PHONY: test test-nyan