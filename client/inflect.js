(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.inflect = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require("./inflect");


},{"./inflect":3}],2:[function(require,module,exports){
var inflect;

inflect = require('../inflect');

inflect.inflections(function(inflect) {
  inflect.plural(/$/, 's');
  inflect.plural(/s$/i, 's');
  inflect.plural(/^(ax|test)is$/i, '$1es');
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
  inflect.plural(/^([m|l])ouse$/i, '$1ice');
  inflect.plural(/^([m|l])ice$/i, '$1ice');
  inflect.plural(/^(ox)$/i, '$1en');
  inflect.plural(/^(oxen)$/i, '$1');
  inflect.plural(/(quiz)$/i, '$1zes');
  inflect.singular(/s$/i, '');
  inflect.singular(/(ss)$/i, '$1');
  inflect.singular(/(n)ews$/i, '$1ews');
  inflect.singular(/([ti])a$/i, '$1um');
  inflect.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis');
  inflect.singular(/(^analy)(sis|ses)$/i, '$1sis');
  inflect.singular(/([^f])ves$/i, '$1fe');
  inflect.singular(/(hive)s$/i, '$1');
  inflect.singular(/(tive)s$/i, '$1');
  inflect.singular(/([lr])ves$/i, '$1f');
  inflect.singular(/([^aeiouy]|qu)ies$/i, '$1y');
  inflect.singular(/(s)eries$/i, '$1eries');
  inflect.singular(/(m)ovies$/i, '$1ovie');
  inflect.singular(/(x|ch|ss|sh)es$/i, '$1');
  inflect.singular(/^([m|l])ice$/i, '$1ouse');
  inflect.singular(/(bus)(es)?$/i, '$1');
  inflect.singular(/(o)es$/i, '$1');
  inflect.singular(/(shoe)s$/i, '$1');
  inflect.singular(/(cris|test)(is|es)$/i, '$1is');
  inflect.singular(/^(a)x[ie]s$/i, '$1xis');
  inflect.singular(/(octop|vir)(us|i)$/i, '$1us');
  inflect.singular(/(alias|status)(es)?$/i, '$1');
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
  inflect.irregular('zombie', 'zombies');
  inflect.uncountable('advice', 'energy', 'excretion', 'digestion', 'cooperation', 'health', 'justice', 'jeans', 'police');
  inflect.uncountable('labour', 'machinery', 'equipment', 'information', 'pollution', 'sewage', 'paper', 'money');
  inflect.uncountable('species', 'series', 'rain', 'rice', 'fish', 'sheep', 'moose', 'deer', 'bison', 'proceedings');
  inflect.uncountable('shears', 'pincers', 'breeches', 'hijinks', 'clippers', 'chassis', 'innings', 'elk');
  return inflect.uncountable('rhinoceros', 'swine', 'you', 'news');
});


},{"../inflect":3}],3:[function(require,module,exports){
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


},{"./default_inflections":2,"./inflections":4,"./methods":5,"./number_extensions":6,"./string_extensions":7}],4:[function(require,module,exports){
var Inflections,
  slice = [].slice;

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
    words = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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


},{}],5:[function(require,module,exports){
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
  var i, len, plural, ref, replacement, result, rule;
  result = word.toString();
  if (word.length === 0 || inflections().uncountables.indexOf(result.toLowerCase()) !== -1) {
    return result;
  } else {
    ref = inflections().plurals;
    for (i = 0, len = ref.length; i < len; i++) {
      plural = ref[i];
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
  var i, inflection, j, len, len1, ref, ref1, replacement, result, rule, singular, uncountable;
  result = word.toString();
  uncountable = false;
  ref = inflections().uncountables;
  for (i = 0, len = ref.length; i < len; i++) {
    inflection = ref[i];
    if (result.search(new RegExp("\\b" + inflection + "$", 'i')) !== -1) {
      uncountable = true;
      break;
    }
  }
  if (word.length === 0 || uncountable) {
    return result;
  } else {
    ref1 = inflections().singulars;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      singular = ref1[j];
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
  var human, i, len, ref, replacement, result, rule;
  result = lower_case_and_underscored_word.toString();
  ref = inflections().humans;
  for (i = 0, len = ref.length; i < len; i++) {
    human = ref[i];
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
    return number + "th";
  } else {
    switch (number_int % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
      default:
        return number + "th";
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
    parameterized_string = parameterized_string.replace(new RegExp(sep + "{2,}", 'g'), sep);
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


},{"../inflect":3}],6:[function(require,module,exports){
var enableNumberExtensions, inflect;

inflect = require('../inflect');

enableNumberExtensions = function() {
  return Number.prototype.ordinalize = function() {
    return inflect.ordinalize(this);
  };
};

exports.enableNumberExtensions = enableNumberExtensions;


},{"../inflect":3}],7:[function(require,module,exports){
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


},{"../inflect":3}]},{},[1])(1)
});
