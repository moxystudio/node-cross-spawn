# cross-spawn

A cross platform solution to node's spawn.


## Installation

`$ npm install cross-spawn`


## Why

Node has issues when using spawn on Windows:

- It ignores [PATHEXT](https://github.com/joyent/node/issues/2318)
- It does not allow you to run `echo` or `dir`

All these issues are handled correctly by `cross-spawn`.


## Usage

Exactly the same way as node's spawn, so it's a drop in replacement.


## Tests

`$ npm test`


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
