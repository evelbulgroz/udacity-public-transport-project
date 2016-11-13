// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `

<div class="error">
	<div class="vertical-align">
		<div>
			<img src="images/error.png" class="error-icon"/>
		</div>
		<div>
			<p class="error-message">
				An error occured,
				<br/>
				please try again.
				<br/>
				<br/>
				<paper-button raised (click)="onOKClick($event)">
					OK
				</paper-button>
			</p>
		</div>
	</div>
</div>

`;