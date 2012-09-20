(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/inflect/index.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Inflections, inflections, methods, number_extensions, string_extensions;

  Inflections = require('./inflections').Inflections;

  inflections = function(callback) {
    if (callback != null) {
      callback.call(this, Inflections.instance());
    }
    return Inflections.instance();
  };

  exports.Inflections = Inflections;

  exports.inflections = inflections;

  methods = require('./methods');

  exports.camelize = methods.camelize;

  exports.underscore = methods.underscore;

  exports.dasherize = methods.dasherize;

  exports.titleize = methods.titleize;

  exports.capitalize = methods.capitalize;

  exports.decapitalize = methods.decapitalize;

  exports.pluralize = methods.pluralize;

  exports.singularize = methods.singularize;

  exports.humanize = methods.humanize;

  exports.ordinalize = methods.ordinalize;

  exports.parameterize = methods.parameterize;

  string_extensions = require('./string_extensions');

  number_extensions = require('./number_extensions');

  exports.enableStringExtensions = string_extensions.enableStringExtensions;

  exports.enableNumberExtensions = number_extensions.enableNumberExtensions;

  exports.enableExtensions = function() {
    string_extensions.enableStringExtensions();
    return number_extensions.enableNumberExtensions();
  };

  require('./default_inflections');

}).call(this);

});

require.define("/inflect/inflections.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Inflections,
    __slice = [].slice;

  Inflections = (function() {

    Inflections.instance = function() {
      return this.__instance__ || (this.__instance__ = new this);
    };

    function Inflections() {
      this.plurals = [];
      this.singulars = [];
      this.uncountables = [];
      this.humans = [];
    }

    Inflections.prototype.plural = function(rule, replacement) {
      var index;
      if (typeof rule === 'string' && (index = this.uncountables.indexOf(rule)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      if ((index = this.uncountables.indexOf(replacement)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      return this.plurals.unshift([rule, replacement]);
    };

    Inflections.prototype.singular = function(rule, replacement) {
      var index;
      if (typeof rule === 'string' && (index = this.uncountables.indexOf(rule)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      if ((index = this.uncountables.indexOf(replacement)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      return this.singulars.unshift([rule, replacement]);
    };

    Inflections.prototype.irregular = function(singular, plural) {
      var index;
      if ((index = this.uncountables.indexOf(singular)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      if ((index = this.uncountables.indexOf(plural)) !== -1) {
        this.uncountables.splice(index, 1);
      }
      if (singular[0].toUpperCase() === plural[0].toUpperCase()) {
        this.plural(new RegExp("(" + singular[0] + ")" + singular.slice(1) + "$", "i"), '$1' + plural.slice(1));
        this.plural(new RegExp("(" + plural[0] + ")" + plural.slice(1) + "$", "i"), '$1' + plural.slice(1));
        return this.singular(new RegExp("(" + plural[0] + ")" + plural.slice(1) + "$", "i"), '$1' + singular.slice(1));
      } else {
        this.plural(new RegExp("" + (singular[0].toUpperCase()) + singular.slice(1) + "$"), plural[0].toUpperCase() + plural.slice(1));
        this.plural(new RegExp("" + (singular[0].toLowerCase()) + singular.slice(1) + "$"), plural[0].toLowerCase() + plural.slice(1));
        this.plural(new RegExp("" + (plural[0].toUpperCase()) + plural.slice(1) + "$"), plural[0].toUpperCase() + plural.slice(1));
        this.plural(new RegExp("" + (plural[0].toLowerCase()) + plural.slice(1) + "$"), plural[0].toLowerCase() + plural.slice(1));
        this.singular(new RegExp("" + (plural[0].toUpperCase()) + plural.slice(1) + "$"), singular[0].toUpperCase() + singular.slice(1));
        return this.singular(new RegExp("" + (plural[0].toLowerCase()) + plural.slice(1) + "$"), singular[0].toLowerCase() + singular.slice(1));
      }
    };

    Inflections.prototype.uncountable = function() {
      var words;
      words = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.uncountables = this.uncountables.concat(words);
    };

    Inflections.prototype.human = function(rule, replacement) {
      return this.humans.unshift([rule, replacement]);
    };

    Inflections.prototype.clear = function(scope) {
      if (scope == null) {
        scope = 'all';
      }
      if (scope === 'all') {
        this.plurals = [];
        this.singulars = [];
        this.uncountables = [];
        return this.humans = [];
      } else {
        return this[scope] = [];
      }
    };

    return Inflections;

  })();

  exports.Inflections = Inflections;

}).call(this);

});

require.define("/inflect/methods.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var camelize, capitalize, dasherize, decapitalize, humanize, inflections, ordinalize, parameterize, pluralize, singularize, titleize, underscore;

  inflections = require('../inflect').inflections;

  camelize = function(lower_case_and_underscored_word, first_letter_in_uppercase) {
    var rest;
    if (first_letter_in_uppercase == null) {
      first_letter_in_uppercase = true;
    }
    rest = lower_case_and_underscored_word.replace(/_./g, function(val) {
      return val.slice(1).toUpperCase();
    });
    if (first_letter_in_uppercase) {
      return lower_case_and_underscored_word[0].toUpperCase() + rest.slice(1);
    } else {
      return lower_case_and_underscored_word[0].toLowerCase() + rest.slice(1);
    }
  };

  underscore = function(camel_cased_word) {
    var word;
    word = camel_cased_word.toString();
    word = word.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
    word = word.replace(/([a-z\d])([A-Z])/g, '$1_$2');
    word = word.replace(/-/g, '_');
    word = word.toLowerCase();
    return word;
  };

  dasherize = function(underscored_word) {
    return underscored_word.replace(/_/g, '-');
  };

  titleize = function(word) {
    return humanize(underscore(word)).replace(/\b('?[a-z])/g, function(val) {
      return capitalize(val);
    });
  };

  capitalize = function(word) {
    return (word[0] || '').toUpperCase() + (word.slice(1) || '').toLowerCase();
  };

  decapitalize = function(word) {
    return (word[0] || '').toLowerCase() + (word.slice(1) || '');
  };

  pluralize = function(word) {
    var plural, replacement, result, rule, _i, _len, _ref;
    result = word.toString();
    if (word.length === 0 || inflections().uncountables.indexOf(result.toLowerCase()) !== -1) {
      return result;
    } else {
      _ref = inflections().plurals;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plural = _ref[_i];
        rule = plural[0];
        replacement = plural[1];
        if (result.search(rule) !== -1) {
          result = result.replace(rule, replacement);
          break;
        }
      }
      return result;
    }
  };

  singularize = function(word) {
    var inflection, replacement, result, rule, singular, uncountable, _i, _j, _len, _len1, _ref, _ref1;
    result = word.toString();
    uncountable = false;
    _ref = inflections().uncountables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inflection = _ref[_i];
      if (result.search(new RegExp("\\b" + inflection + "$", 'i')) !== -1) {
        uncountable = true;
        break;
      }
    }
    if (word.length === 0 || uncountable) {
      return result;
    } else {
      _ref1 = inflections().singulars;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        singular = _ref1[_j];
        rule = singular[0];
        replacement = singular[1];
        if (result.search(rule) !== -1) {
          result = result.replace(rule, replacement);
          break;
        }
      }
      return result;
    }
  };

  humanize = function(lower_case_and_underscored_word) {
    var human, replacement, result, rule, _i, _len, _ref;
    result = lower_case_and_underscored_word.toString();
    _ref = inflections().humans;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      human = _ref[_i];
      rule = human[0];
      replacement = human[1];
      if (result.search(rule) !== -1) {
        result = result.replace(rule, replacement);
        break;
      }
    }
    return capitalize(result.replace(/_id$/, '').replace(/_/g, ' '));
  };

  ordinalize = function(number) {
    var number_int;
    number_int = parseInt(number, 10);
    if ([11, 12, 13].indexOf(number_int % 100) !== -1) {
      return "" + number + "th";
    } else {
      switch (number_int % 10) {
        case 1:
          return "" + number + "st";
        case 2:
          return "" + number + "nd";
        case 3:
          return "" + number + "rd";
        default:
          return "" + number + "th";
      }
    }
  };

  parameterize = function(string, sep) {
    var parameterized_string;
    if (sep == null) {
      sep = '-';
    }
    parameterized_string = string.toString();
    parameterized_string = parameterized_string.replace(/[^a-z0-9\-_]+/gi, sep);
    if (sep != null) {
      parameterized_string = parameterized_string.replace(new RegExp("" + sep + "{2,}", 'g'), sep);
      parameterized_string = parameterized_string.replace(new RegExp("^" + sep + "|" + sep + "$", 'gi'), '');
    }
    return parameterized_string.toLowerCase();
  };

  exports.camelize = camelize;

  exports.underscore = underscore;

  exports.dasherize = dasherize;

  exports.titleize = titleize;

  exports.capitalize = capitalize;

  exports.decapitalize = decapitalize;

  exports.pluralize = pluralize;

  exports.singularize = singularize;

  exports.humanize = humanize;

  exports.ordinalize = ordinalize;

  exports.parameterize = parameterize;

}).call(this);

});

require.define("/inflect/string_extensions.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var enableStringExtensions, inflect;

  inflect = require('../inflect');

  enableStringExtensions = function() {
    String.prototype.pluralize = function() {
      return inflect.pluralize(this);
    };
    String.prototype.singularize = function() {
      return inflect.singularize(this);
    };
    String.prototype.camelize = function(first_letter_in_uppercase) {
      if (first_letter_in_uppercase == null) {
        first_letter_in_uppercase = true;
      }
      return inflect.camelize(this, first_letter_in_uppercase);
    };
    String.prototype.capitalize = function() {
      return inflect.capitalize(this);
    };
    String.prototype.decapitalize = function() {
      return inflect.decapitalize(this);
    };
    String.prototype.titleize = function() {
      return inflect.titleize(this);
    };
    String.prototype.underscore = function() {
      return inflect.underscore(this);
    };
    String.prototype.dasherize = function() {
      return inflect.dasherize(this);
    };
    String.prototype.parameterize = function(sep) {
      if (sep == null) {
        sep = '-';
      }
      return inflect.parameterize(this, sep);
    };
    return String.prototype.humanize = function() {
      return inflect.humanize(this);
    };
  };

  exports.enableStringExtensions = enableStringExtensions;

}).call(this);

});

require.define("/inflect/number_extensions.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var enableNumberExtensions, inflect;

  inflect = require('../inflect');

  enableNumberExtensions = function() {
    return Number.prototype.ordinalize = function() {
      return inflect.ordinalize(this);
    };
  };

  exports.enableNumberExtensions = enableNumberExtensions;

}).call(this);

});

require.define("/inflect/default_inflections.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var inflect;

  inflect = require('../inflect');

  inflect.inflections(function(inflect) {
    inflect.plural(/$/, 's');
    inflect.plural(/s$/i, 's');
    inflect.plural(/(ax|test)is$/i, '$1es');
    inflect.plural(/(octop|vir)us$/i, '$1i');
    inflect.plural(/(octop|vir)i$/i, '$1i');
    inflect.plural(/(alias|status)$/i, '$1es');
    inflect.plural(/(bu)s$/i, '$1ses');
    inflect.plural(/(buffal|tomat)o$/i, '$1oes');
    inflect.plural(/([ti])um$/i, '$1a');
    inflect.plural(/([ti])a$/i, '$1a');
    inflect.plural(/sis$/i, 'ses');
    inflect.plural(/(?:([^f])fe|([lr])f)$/i, '$1$2ves');
    inflect.plural(/(hive)$/i, '$1s');
    inflect.plural(/([^aeiouy]|qu)y$/i, '$1ies');
    inflect.plural(/(x|ch|ss|sh)$/i, '$1es');
    inflect.plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices');
    inflect.plural(/([m|l])ouse$/i, '$1ice');
    inflect.plural(/([m|l])ice$/i, '$1ice');
    inflect.plural(/^(ox)$/i, '$1en');
    inflect.plural(/^(oxen)$/i, '$1');
    inflect.plural(/(quiz)$/i, '$1zes');
    inflect.singular(/s$/i, '');
    inflect.singular(/(n)ews$/i, '$1ews');
    inflect.singular(/([ti])a$/i, '$1um');
    inflect.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, '$1$2sis');
    inflect.singular(/(^analy)ses$/i, '$1sis');
    inflect.singular(/([^f])ves$/i, '$1fe');
    inflect.singular(/(hive)s$/i, '$1');
    inflect.singular(/(tive)s$/i, '$1');
    inflect.singular(/([lr])ves$/i, '$1f');
    inflect.singular(/([^aeiouy]|qu)ies$/i, '$1y');
    inflect.singular(/(s)eries$/i, '$1eries');
    inflect.singular(/(m)ovies$/i, '$1ovie');
    inflect.singular(/(x|ch|ss|sh)es$/i, '$1');
    inflect.singular(/([m|l])ice$/i, '$1ouse');
    inflect.singular(/(bus)es$/i, '$1');
    inflect.singular(/(o)es$/i, '$1');
    inflect.singular(/(shoe)s$/i, '$1');
    inflect.singular(/(cris|ax|test)es$/i, '$1is');
    inflect.singular(/(octop|vir)i$/i, '$1us');
    inflect.singular(/(alias|status)es$/i, '$1');
    inflect.singular(/^(ox)en/i, '$1');
    inflect.singular(/(vert|ind)ices$/i, '$1ex');
    inflect.singular(/(matr)ices$/i, '$1ix');
    inflect.singular(/(quiz)zes$/i, '$1');
    inflect.singular(/(database)s$/i, '$1');
    inflect.irregular('person', 'people');
    inflect.irregular('man', 'men');
    inflect.irregular('child', 'children');
    inflect.irregular('move', 'moves');
    inflect.irregular('she', 'they');
    inflect.irregular('he', 'they');
    inflect.irregular('myself', 'ourselves');
    inflect.irregular('yourself', 'ourselves');
    inflect.irregular('himself', 'themselves');
    inflect.irregular('herself', 'themselves');
    inflect.irregular('themself', 'themselves');
    inflect.irregular('mine', 'ours');
    inflect.irregular('hers', 'theirs');
    inflect.irregular('his', 'theirs');
    inflect.irregular('its', 'theirs');
    inflect.irregular('theirs', 'theirs');
    inflect.irregular('sex', 'sexes');
    inflect.irregular('cow', 'kine');
    inflect.irregular('zombie', 'zombies');
    inflect.uncountable('advice', 'energy', 'excretion', 'digestion', 'cooperation', 'health', 'justice', 'jeans');
    inflect.uncountable('labour', 'machinery', 'equipment', 'information', 'pollution', 'sewage', 'paper', 'money');
    inflect.uncountable('species', 'series', 'rain', 'rice', 'fish', 'sheep', 'moose', 'deer', 'bison', 'proceedings');
    inflect.uncountable('shears', 'pincers', 'breeches', 'hijinks', 'clippers', 'chassis', 'innings', 'elk');
    return inflect.uncountable('rhinoceros', 'swine', 'you', 'news');
  });

}).call(this);

});

require.define("/index.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {

  module.exports = require("./inflect");

}).call(this);

});
require("/index.coffee");

window.inflect = require('./inflect');})();
