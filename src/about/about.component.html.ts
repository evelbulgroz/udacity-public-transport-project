// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `
<div class="portrait"><img src="images/ulrik.jpg"/></div>
<p>Hi, I\'m Ulrik H. Gade.</p>
<p>I created this app mid-late 2016 as an exercise in "offline-first" Web app design for my Senior Web Developer Nanodegree course at <a href="http://www.udacity.com" target="_blank">Udacity.com</a>.</p>
<p>I also used it to learn <a href="http://angular.io/" target="_blank">Angular2</a>, <a href="http://www.typescriptlang.org/" target="_blank">TypeScript</a>, and <a href="https://elements.polymer-project.org/" target="_blank">Polymer elements</a>; and to experiment with how far I could take an ambitious, loosely coupled, "classic" object-oriented technical design on a mobile platform.</p>
<p>Please see the source code, Readme file and the other documentation in my <a href="https://github.com/evelbulgroz" target="_blank">Github repo</a> for more technical details.</p>
<p>In this project, my priority was on the technical (programming) stuff, so the visual design may have some rough edges.</p>
<p>Still, I hope you'll enjoy the app.</p>
`;