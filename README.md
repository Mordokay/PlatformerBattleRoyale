# PlatformerBattleRoyale

## Server side configuration:

To run this project first you have to instal the necessary node.js modules.

To install node modules type
> npm install

Next you have also to install matter-js (2D physics engine)  to be run on the server:
> npm install matter-js

If you start the server you will get an error like this:

ReferenceError: HTMLElement is not defined.

To correct that you have to change some lines in matter.js file located at _your_project_dir_\node_modules\matter-js\build\matter.js:
Next go to line 4390 and change the function:

```javascript
Common.isElement = function(obj) {
        return obj instanceof HTMLElement;
    };
```

To:

```javascript
Common.isElement = function(obj) {
        return typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement;
    };
```
    
Now you are ready to start the server! To do this type:
> npm start
Your server should start and should be listening for clients on the port 25565

## How to run the client

To run the client simply go to your browser and type the url:
http://localhost:25565/
