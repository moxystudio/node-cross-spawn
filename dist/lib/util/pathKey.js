function pathKey(options) {
    if (options === void 0) { options = {}; }
    var _a = options.env, env = _a === void 0 ? process.env : _a, _b = options.platform, platform = _b === void 0 ? process.platform : _b;
    if (platform !== "win32") {
        return "PATH";
    }
    return (Object.keys(env)
        .reverse()
        .find(function (key) { return key.toUpperCase() === "PATH"; }) || "Path");
}
module.exports = pathKey;
