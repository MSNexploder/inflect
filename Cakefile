# shamelessly taken from Zombie

fs            = require("fs")
path          = require("path")
{spawn, exec} = require("child_process")
stdout        = process.stdout

# Use executables installed with npm bundle.
process.env["PATH"] = "node_modules/.bin:#{process.env["PATH"]}"

# ANSI Terminal Colors.
bold  = "\033[0;1m"
red   = "\033[0;31m"
green = "\033[0;32m"
reset = "\033[0m"

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
  fs.readFile "package.json", "utf8", (err, package) ->
    #log "Need runtime dependencies, installing into node_modules ...", green
    #exec "npm bundle", onerror

    log "Need development dependencies, installing ...", green
    for name, version of JSON.parse(package).devDependencies
      log "Installing #{name} #{version}", green
      exec "npm bundle install \"#{name}@#{version}\"", onerror

task "install", "Install inflect in your local repository", ->
  build (err) ->
    onerror err
    generateMan (err) ->
      onerror err
      log "Installing inflect ...", green
      exec "npm install", (err, stdout, stderr) ->
        process.stdout.write stderr
        onerror err


## Building ##

build = (callback) ->
  log "Compiling CoffeeScript to JavaScript ...", green
  exec "rm -rf lib && coffee -c -l -b -o lib src", callback
task "build", "Compile CoffeeScript to JavaScript", -> build onerror

task "watch", "Continously compile CoffeeScript to JavaScript", ->
  cmd = spawn("coffee", ["-c", "-l", "-b", "-w", "-o", "lib", "src"])
  cmd.stdout.on "data", (data) -> process.stdout.write green + data + reset
  cmd.on "error", onerror


clean = (callback) ->
  exec "rm -rf html lib", callback
task "clean", "Remove temporary files and such", -> clean onerror


## Testing ##

runTests = (callback) ->
  log "Running test suite ...", green
  exec "find spec -name '*-spec.coffee' -print | xargs vows", (err, stdout, stderr) ->
    process.stdout.write stdout
    process.binding('stdio').writeError stderr
    callback err if callback
task "test", "Run all tests", ->
  runTests (err) ->
    process.stdout.on "drain", -> process.exit -1 if err


## Documentation ##

# Markdown to HTML.
#toHTML = (source, callback) ->
#  target = "html/#{path.basename(source, ".md").toLowerCase()}.html"
#  fs.readFile "doc/layout/main.html", "utf8", (err, layout) ->
#    onerror err
#    fs.readFile source, "utf8", (err, text) ->
#      onerror err
#      log "Creating #{target}", green
#      exec "ronn --html #{source}", (err, stdout, stderr) ->
#        onerror err
#        [name, title] = stdout.match(/<h1>(.*)<\/h1>/)[1].split(" -- ")
#        name = name.replace(/\(\d\)/, "")
#        body = stdout.replace(/<h1>.*<\/h1>/, "")
#        html = layout.replace("{{body}}", body).replace(/{{title}}/g, title)
#        fs.writeFile target, html, "utf8", (err) ->
#          callback err, target

#documentPages = (callback) ->
#  files = fs.readdirSync(".").filter((file) -> path.extname(file) == ".md").
#    concat(fs.readdirSync("doc").filter((file) -> path.extname(file) == ".md").map((file) -> "doc/#{file}"))
#  fs.mkdir "html", 0777, ->
#    convert = ->
#      if file = files.pop()
#        toHTML file, (err) ->
#          onerror err
#          convert()
#      else
#        process.stdout.write "\n"
#        fs.readFile "html/readme.html", "utf8", (err, html) ->
#          html = html.replace(/<h1>(.*)<\/h1>/, "<h1>inflect.js</h1><b>$1</b>")
#          fs.writeFile "html/index.html", html, "utf8", onerror
#          fs.unlink "html/readme.html", onerror
#          exec "cp -fr doc/css doc/images html/", callback
#    convert()

documentSource = (callback) ->
  log "Documenting source files ...", green
  exec "docco src/*.coffee src/**/*.coffee", (err, stdout, stderr) ->
    log stdout, green
    onerror err
    callback()
    #log "Copying to html/source", green
    #exec "mkdir -p html && cp -rf docs/ html/source && rm -rf docs", callback

generateDocs = (callback) ->
  log "Generating documentation ...", green
  #documentPages (err) ->
  #  onerror err
  #  documentSource callback
  documentSource callback

#task "doc:pages",  "Generate documentation for main pages",    -> documentPages onerror
task "doc:source", "Generate documentation from source files", -> documentSource onerror
task "doc",        "Generate all documentation",               -> generateDocs onerror

## Publishing ##

#publishDocs = (callback) ->
#  log "Uploading documentation ...", green
#  exec "rsync -chr --del --stats html/ labnotes.org:/var/www/zombie/", (err, stdout, stderr) ->
#    log stdout, green
#    callback err
#task "doc:publish", "Publish documentation to site", ->
#  documentPages (err) ->
#    onerror err
#    documentSource (err) ->
#      onerror err
#      generatePDF (err) ->
#        onerror err
#        publishDocs onerror

task "publish", "Publish new version (Git, NPM, site)", ->
  # Run tests, don't publish unless tests pass.
  runTests (err) ->
    onerror err
    # Clean up temporary files and such, want to create everything from
    # scratch, don't want generated files we no longer use, etc.
    clean (err) ->
      onerror err
      exec "git push", (err) ->
        onerror err
        fs.readFile "package.json", "utf8", (err, package) ->
          package = JSON.parse(package)

          # Publish documentation, need these first to generate man pages,
          # inclusion on NPM package.
          generateDocs (err) ->
            onerror err

            log "Publishing to NPM ...", green
            build (err) ->
              onerror err
              exec "npm publish", (err, stdout, stderr) ->
                log stdout, green
                onerror err

                # Create a tag for this version and push changes to Github.
                log "Tagging v#{package.version} ...", green
                exec "git tag v#{package.version}", (err, stdout, stderr) ->
                  log stdout, green
                  exec "git push --tags origin master", (err, stdout, stderr) ->
                    log stdout, green

            # We can do this in parallel.
            #publishDocs onerror
