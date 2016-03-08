**done-ssr** is able to handle server-side rendering of your application by loading it in a custom module loader based on [StealJS](http://stealjs.com/). In order to work done-ssr exports your main module to export a function which handles rendering (defined in your package.json).  This function look like (note that the examples are in ES6, but all formats are supported):

### main.js
```js
import initApp from './init';

export default function(request)
  let title = document.createElement("title");
  title.appendChild(document.createTextNode("Hello world"));
  document.head.appendChild(title);

  document.body.appendChild(initApp(request));
}
```

Your renderer function can do whatever is needed to render the application and insert the result into the document. You can manipulate the `document.head` to insert a title, mount your app to a particular element in the body, or anything else. 

render doesn't have a return value, done-ssr will know when the app is finished rendering and will serialize the entire document into a string.
