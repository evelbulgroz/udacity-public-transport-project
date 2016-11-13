// write css as ts string array so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const styles = [

`
/*
.error .vertical-align {
	height: 360px;
	height: 70vh;
}
*/`,

`img.error-icon {
	height: 48px;
	width: 48px;
}`,

`p.error-message {
	margin-left: 24px;
	margin-right: 24px;
	text-align: center;
}`

];