// write css as ts string array so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const styles = [

`p {
	margin-left: 15px;
	margin-right: 15px;
}`,

`.portrait {
    width: 100px;
    height: 100px;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
}`,

`img {
    display: inline;
    margin: 0 auto;
    height: 100%;
    width: auto;
}`

];