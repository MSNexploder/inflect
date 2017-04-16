# Inflect [![Build Status](https://secure.travis-ci.org/MSNexploder/inflect.png)](http://travis-ci.org/MSNexploder/inflect)

A port of the Rails / ActiveSupport inflector to JavaScript (node.js and browser compatible).

## Install

    npm install inflect

[Client version](https://raw.github.com/MSNexploder/inflect/master/client/inflect.js)

[Client version (minified)](https://raw.github.com/MSNexploder/inflect/master/client/inflect.min.js)

## Documentation

[Documentation](http://msnexploder.github.com/inflect)

## Usage

    inflect.pluralize('user'); // users

    inflect.singularize('users'); // user

    inflect.camelize('users_controller'); // UsersController

    inflect.capitalize('user'); // User

    inflect.decapitalize('User'); // user

    inflect.titleize('man from the boondocks'); // Man From The Boondocks

    inflect.underscore('UsersController'); // users_controller

    inflect.dasherize('puni_puni'); // puni-puni

    inflect.parameterize('Donald E. Knuth'); // donald-e-knuth

    inflect.humanize('employee_salary'); // Employee salary

## Note on Patches/Pull Requests

* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with cakefile, package.json, version, or history. (if you want to have your own version, that is fine but bump version in a commit by itself I can ignore when I pull)
* Send me a pull request. Bonus points for topic branches.
