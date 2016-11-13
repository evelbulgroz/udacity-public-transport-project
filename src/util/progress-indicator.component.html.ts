// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `

<div class="vertical-align">
	<div>
		<img src="images/spinner.gif" class="progress-indicator"/>
	</div>
	<div>
		<p class="progress-indicator">
			{{label}}
		</p>
	</div>
</div>

`;