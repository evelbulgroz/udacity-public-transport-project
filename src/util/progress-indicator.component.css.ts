// write css as ts string array so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const styles = [

`img.progress-indicator {
	height: 96px;
	width: 96px;
}`,

`p.progress-indicator {
	margin-left: 24px;
	margin-right: 24px;
	text-align: center;
}`

];