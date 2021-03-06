// write css as ts string array so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const styles = [

`div.api-map {
		z-index: -1;
		position: absolute;
		top: 150px;
		text-align: center;
	}`,
	
	`img.api-map {
		max-width: 90%;
	}`,

`vaadin-grid {
	height: 100%;
}`,

`.nomatch {
	text-align: center;
}`

];