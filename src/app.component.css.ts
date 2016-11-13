// write css as ts string array so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const styles = [

`a:link {
    text-decoration: none;
	color: inherit;
}`,

`app-toolbar {
	background: var(--primary-color);
	color: var(--dark-theme-text-color);
}`,

`app-toolbar.raised {
	@apply(--shadow-elevation-4dp);
}`,

`.drawer-item {
	padding: 15px;
}`,

`paper-icon-button {
	position: absolute;
	top: 12px;
	left: 8px;
}`

];