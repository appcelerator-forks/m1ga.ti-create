var at = require("atom"),
    EditorView = at.EditorView,
    File = at.File,
    Directory = at.Directory,
    BufferedProcess = at.BufferedProcess;

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

        miniEditor = document.createElement('atom-text-editor');
        miniEditor.setAttribute('mini', true);
        atom.workspace.addTopPanel({
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
                } else if (e.keyCode == 13) {
                    if (str !== "") {
                        args = new Array("create", "-n", str, "-p", "all", "-t", "app", "--no-prompt", "--id", "com." + str, "--workspace-dir", ppath);
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
                                cwd: ppath + "/" + str
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
                                atom.open({pathsToOpen:ppath + "/" + str});
                            });
                        });
                        miniEditor.remove();
                    } else {
                        miniEditor.remove();
                    }
                }
            }
        };

    } else {
        var fold = new Directory(ppath + "/app/");
        if (fold.getEntriesSync().length > 0) {

            miniEditor = document.createElement('atom-text-editor');
            miniEditor.setAttribute('mini', true);
            atom.workspace.addTopPanel({
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
                    }
                }
            };
        } else {
            atom.notifications.addError("Doesn't look like an Alloy project");
        }
    }
}
