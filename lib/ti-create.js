var at = require("atom"),
    File = at.File,
    Directory = at.Directory,
    BufferedProcess = at.BufferedProcess,
    remote = require("remote"),
    dialog = remote.require("dialog");



module.exports = {
    activate: function() {
        atom.commands.add('atom-workspace', 'ti-create:controller', this.createController);
        atom.commands.add('atom-workspace', 'ti-create:widget', this.createWidget);
        atom.commands.add('atom-workspace', 'ti-create:project', this.createProject);
    },

    createController: function() {
        create("controller");
    },
    createWidget: function() {
        create("widget");
    },
    createProject: function() {
        create("project");
    }
};

function create(what) {

    // check if ti cli is available
    var process = new BufferedProcess({
        command: "titanium"
    });
    process.onWillThrowError(function() {
        atom.notifications.addError("Please install titanium cli or add it to your PATH variable");
        return;
    });

    var editor = atom.workspace.activePaneItem;
    // get project path
    var ppath = atom.project.getPaths()[0];
    // check for alloy

    if (what == "project") {
        // create new alloy project
        var output = dialog.showOpenDialog({
            title: "Create and select project folder",
            filter: ".",
            properties: ['openDirectory']
        });

        if (output.length > 0) {
            output = output[0];
            var name = output.match(/([^\/]*)\/*$/)[1]
            var folder = output.substring(0, output.lastIndexOf('/'));
            var appId = "com.app.id";

            args = new Array("create", "-n", name, "-p", "all", "-t", "app", "--no-prompt", "--id", appId, "--workspace-dir", folder);
            atom.notifications.addInfo("Please wait - creating folder...");
            var process = new BufferedProcess({
                command: "titanium",
                args: args,
                stdout: function(e) {
                    console.log(e);
                }
            });
            process.process.on('exit', function() {
                // make it an alloy project
                atom.notifications.addInfo("Please wait - creating alloy project...");
                var options = {
                    cwd: output
                };
                var process = new BufferedProcess({
                    command: "alloy",
                    options: options,
                    args: ["new"],
                    stdout: function(e) {
                        console.log(e);
                    },
                    stderr: function(e) {
                        console.log(e);
                    }
                });
                process.process.on('exit', function() {
                    atom.notifications.addSuccess("Done - opening folder...");
                    atom.open({
                        pathsToOpen: output
                    });
                });
            });
        }
    } else {
        var fold = new Directory(ppath + "/app/");
        if (fold.getEntriesSync().length > 0) {

            var miniEditor = document.createElement('atom-text-editor');
            miniEditor.setAttribute('mini', true);
            var inputPanel = atom.workspace.addModalPanel({
                item: miniEditor
            });
            miniEditor.focus();

            miniEditor.onkeyup = function(e) {
                // get text content
                var str = miniEditor.getModel().getText();

                if (str.length > 0) {
                    if (e.keyCode == 27) {
                        // ESC
                        miniEditor.remove();
                        inputPanel.destroy();
                    } else if (e.keyCode == 13) {
                        if (str !== "") {
                            // only if string is not empty
                            var options = {
                                cwd: atom.project.getPaths()[0]
                            };
                            var args;

                            if (what == "controller") {
                                args = ["generate", "controller", str];
                            } else if (what == "widget") {
                                // create widget
                                args = ["generate", "widget", str];
                            }
                            var process = new BufferedProcess({
                                command: "alloy",
                                options: options,
                                args: args,
                                stdout: function(e) {
                                    console.log(e);
                                },
                                stderr: function(e) {
                                    console.log(e);
                                }
                            });
                        }
                        miniEditor.remove();
                        inputPanel.destroy();
                    }
                }
            };
        } else {
            atom.notifications.addError("Doesn't look like an Alloy project");
        }
    }
}
