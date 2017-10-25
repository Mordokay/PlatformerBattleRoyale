# PlatformerBattleRoyale

## Server side configuration:

To run this project first you have to instal the necessary node.js modules.

To install node modules type
> npm install

Next you have also to install matter-js (2D physics engine)  to be run on the server:
> npm install matter-js

To process custom shapes from SVG files install poly-decomp:
> npm install poly-decomp

Next go to the file matter.js located on "_your_project_dir_\node_modules\matter-js\build\matter.js"
Change the line 6483 from:

```javascript
var decomp = _dereq_('poly-decomp/build/decomp.js');
```
 To:
 
```javascript
var decomp = (typeof window !== "undefined" ? window['decomp'] : typeof global !== "undefined" ? global['decomp'] : null);
```

Also change the function on line 4390 from:

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
