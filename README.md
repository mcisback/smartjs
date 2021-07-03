
# SmartJS

SmartJS is a javascript micro framework that takes
concepts from vuejs and alpinejs.
It has been developed to undestand how
a modern js framework like VueJS works under the hood.
What's different ?
SmartJS analise the html first and then keeps track of every
method, variable and so on... So when something changes, it knows 
exactly what and where to modify DOM, and also,
it doesn't modify all the DOM, but just the required parts.
So it doesn't need a VirtualDOM,
a DOM Diff (for now at least), and it doesn't use InnerHTML,
for the most part. Just a sprinkle of it. Seriously.
It is also optimized to make the least possible loops, and so on.

Feel free to make it better and use it for your projects...

## Authors

- Marco Caggiano <mcisback@gmail.com> - GitHub: [@mcisback](https://www.github.com/mcisback)

  
## Demo

Clone the repo and you can use this: https://github.com/mcisback/smartjs/blob/master/index.html
as demo.
Just run `npm run build` or `npm run watch` to build it.
  
## Features

- No Virtual DOM
- No InnerHTML, just a sprinkle
- Focus on optimization, speed, and low memory usage As Far As Possibile
- Uses classes and modern Javascript
- Inspired by AlpineJS so it easy to use, no compless files and
project structure, you could just put a CDN and run it.
  
## Installation 

Install SmartJS with npm,
first clone it:

```bash 
  git clone https://github.com/mcisback/smartjs.git
  cd smartjs
```

Then install dependencies:
```bash 
  npm install
``` 

And then build it

```bash 
  npm run build
```

This should output smart.js in the dist folder.

If you install live-server, you can try the included demo
```bash 
  npm install -g live-server
  live-server
```

What can you do !
Everything !
The limit is your imagination ! :D

To use into your project, just include the dist/smart.js
into you script tag

```html 
  <!-- Before body closes -->
  <script src="path_to_smart_js/smart.js"></script>

  <!-- Or in head with defer -->
  <script src="path_to_smart_js/smart.js" defer></script>
```
## Documentation

[Documentation](https://github.com/mcisback/smartjs)

  SmartJS is divided in components...
  there is no virtual dom as everything is tracked by
  an internal map.
  Every component is bound to an HTML Element, and every components
  can be included in other components with it's special
  tag, like in VueJS.
  Every prop is proxied with a custom proxy class.

  Example:
  ```Javascript

  <div id="helloWorld"></div>

  <script src="/dist/smart.js"></script>
  
  <template HelloWorld>
        <div>
            <div>Hello {{name}} !</div>
            <br>
            I'm the Hello World Component !

            <div sj:if="checkme">
                <h2>You Checked Me !</h2>
            </div>

            <form>
                <div class="form-group row">
                    <label for="checkme" sj:click="checkme = !checkme">
                        <input type="checkbox" name="checkme" sj:model="checkme">

                        <span>Check Me !</span>
                    </label>
                </div>
            </form>
        </div>

        <button class="btn btn-primary" sj:click="sayhello">Click Me !</button>
    </template>

    <script>
        const HelloWorldComponent = new SJ.Component({
            name: "HelloWorld",
            props: {
                name: "Marco",
                checkme: false
            },
            methods: {
                sayhello: (ev) => {
                    ev.preventDefault();

                    alert("Hello World !");
                }
            },
            template: document.querySelector('[HelloWorld]'),
            render: () => {
                console.log("HelloWorld render()");
            }
        });

        // Render and append it to root element

        let root = document.querySelector('#helloWorld');

        HelloWorldComponent.render(true);

        root.innerHTML = "";
        root.appendChild(HelloWorldComponent.getDomElement());
    </script>

  ```

  {{name}} is substituted by prop value "Marco" and checkbox is double 
  binded to checkme prop.
  Also when you click on button, it will alert "Hello World".
  It is as simple as it.

  SmartJS has also an App Class to automate the root.innerHTML part,
  and has also a Router class to manage routes.
  For example, with App and Router, this would have been:
  ```Javascript
  <script>
        new SJ.App({
            // You can pass functions and HTMLElements also
            rootElement: '#helloWorld',
            router: new SJ.Router({
                routes: new Map([
                    ["index", {
                        path: "/",
                        component: HelloWorldComponent
                    }]
                ])
            }),
            // This is optional but usefull when you
            // have lots of components
            components: [
                HelloWorldComponent,
            ]
        });
    </script>
  ```

  For a more complex example have a look at LoginComponent
  in the index.html file (the demo).

  That's it for now !
  Feel free to contact me for job,
  proposal, contribution, conversation,
  or to offer me a beer, at least. :)