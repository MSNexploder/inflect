# shamelessly taken from Zombie

fs            = require("fs")
path          = require("path")
{spawn, exec} = require("child_process")
stdout        = process.stdout

# Use executables installed with npm bundle.
process.env["PATH"] = "node_modules/.bin:#{process.env["PATH"]}"

# ANSI Terminal Colors.
bold  = '\x1B[0;1m'
red   = '\x1B[0;31m'
green = '\x1B[0;32m'
reset = '\x1B[0m'

# Log a message with a color.
log = (message, color, explanation) ->
  console.log color + message + reset + ' ' + (explanation or '')

# Handle error and kill the process.
onerror = (err) ->
  if err
    process.stdout.write "#{red}#{err.stack}#{reset}\n"
    process.exit -1


## Setup ##

# Setup development dependencies, not part of runtime dependencies.
task "setup", "Install development dependencies", ->
  fs.readFile "package.json", "utf8", (err, pack) ->
    #log "Need runtime dependencies, installing into node_modules ...", green
    #exec "npm bundle", onerror

    log "Need development dependencies, installing ...", green
    for name, version of JSON.parse(pack).devDependencies
      log "Installing #{name} #{version}", green
      exec "npm install \"#{name}@#{version}\"", onerror

task "install", "Install inflect in your local repository", ->
  build (err) ->
    onerror err
    log "Installing inflect ...", green
    exec "npm install", (err, stdout, stderr) ->
      process.stdout.write stderr
      onerror err


## Building ##

build = (callback) ->
  log "Compiling CoffeeScript to JavaScript ...", green
  exec "rm -rf lib && coffee -c -b -o lib src", ->
    log "Building client side script ...", green
    buildClient 'inflect', callback
task "build", "Compile CoffeeScript to JavaScript", -> build onerror

task "watch", "Continously compile CoffeeScript to JavaScript", ->
  cmd = spawn("coffee", ["-c", "-b", "-w", "-o", "lib", "src"])
  cmd.stdout.on "data", (data) -> process.stdout.write green + data + reset
  cmd.on "error", onerror

buildClient = (name, callback) ->
  browserify = require('browserify')
  coffeeify = require('coffeeify')
  UglifyJS = require('uglify-js')

  b = browserify({"extensions": [".coffee"], "standalone": "inflect"})
  b.transform coffeeify
  b.add path.join(__dirname, 'src/index.coffee')

  b.bundle (err, result) ->
    onerror err
    fs.writeFile "client/#{name}.js", result, ->
      min_result = UglifyJS.minify result.toString()
      fs.writeFile "client/#{name}.min.js", min_result.code, callback

documentSource = (callback) ->
  log "Documenting source files ...", green
  exec "docco src/index.coffee src/inflect/*.coffee", (err, stdout, stderr) ->
    log stdout, green
    onerror err
    callback()
task "doc:source", "Generate documentation from source files", -> documentSource onerror

clean = (callback) ->
  exec "rm -rf lib docs", callback
task "clean", "Remove temporary files and such", -> clean onerror


## Testing ##

runTests = (callback) ->
  log "Running test suite ...", green
  exec "vows spec/*-spec.coffee", (err, stdout, stderr) ->
    process.stdout.write stdout
    process.stderr.write stderr
    callback err if callback

task "test", "Run all tests", ->
  runTests (err) ->
    process.stdout.on "drain", -> process.exit -1 if err

task "test:client", "Run client tests", ->
  build ->
    log "Opening client tests in browser ...", green
    exec "open spec/client/index.html"

task "publish", "Publish new version (Git, NPM, site)", ->
  # Run tests, don't publish unless tests pass.
  runTests (err) ->
    onerror err
    # Clean up temporary files and such, want to create everything from
    # scratch, don't want generated files we no longer use, etc.
    clean (err) ->
      onerror err
      build (err) ->
        onerror err
        exec "git push", (err) ->
          onerror err
          fs.readFile "package.json", "utf8", (err, pack) ->
            pack = JSON.parse(pack)

            # Publish documentation, need these first to generate man pages,
            # inclusion on NPM package.
            documentSource (err) ->
              log "Publishing to NPM ...", green
              exec "npm publish", (err, stdout, stderr) ->
                log stdout, green
                onerror err

                # Create a tag for this version and push changes to Github.
                log "Tagging v#{pack.version} ...", green
                exec "git tag v#{pack.version}", (err, stdout, stderr) ->
                  log stdout, green
                  exec "git push --tags origin master", (err, stdout, stderr) ->
                    log stdout, green
