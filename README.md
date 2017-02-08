# ti-create - create Appcelerator Titanium Alloy projects, widgets and controllers

This package allows you to create a new Titanium (Alloy) project or a widget/controller inside an existing Alloy project.

### create a project

* run `Titanium: create project`
* go to the parent directory
* create a new (project) folder
* select the new folder and click 'ok'

It will automatically create a new project inside the folder and opens a new atom instance with the project


### create a widget / controller / model

To create a new controller or widget you have to be inside an existing Alloy folder.

* run `Titanium: create widget` / `Titanium: create controller` / `Titanum: create model`
* add the name in the input dialog

#### OSX hint
If you have the following error 'Failed to spawn command alloy. Make sure alloy is installed and on your PATH' try the following:
~~~
Add this to init.coffee (CMD+,) open config Folder select init.coffee

process.env.PATH = ["/usr/bin",
"/usr/local/bin",
"/bin",
"/usr/sbin",
"/sbin"
process.env.PATH].join(":")

Now the $PATH get loaded even Atom is launched from Doc or Launchpad
~~~
(mentioned here: https://github.com/m1ga/ti-create/issues/3#issuecomment-132251665)
