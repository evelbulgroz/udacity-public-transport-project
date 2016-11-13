// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `

<!-- Angular 2's built in 'ngForm' functionality mostly only seems to work with native form controls, not with
 ones embedded in polymer elements (e.g. vaadin-combo-box and paper-input), so can't much use ngForm here.-->
<div>
	<form>
		<!-- origin (from) selector -->
		<vaadin-combo-box
			id="origin"
			label="From"
			[items]="originSuggestions"
			item-label-path="_name"
			item-value-path="_modelId"
			[(value)]="originId"
			name="origin"
			(keyup)="onFromToKeyUp($event)"
			(selected-item-changed)="onFromToChange($event)"
			required
			aria-required="true">
    	</vaadin-combo-box>	
		<!-- destination (to) selector -->
		<vaadin-combo-box
			id="destination"
			label="To"
			[items]="destinationSuggestions"
			item-label-path="_name"
			item-value-path="_modelId"
			[(value)]="destinationId"
			name="destination"
			(keyup)="onFromToKeyUp($event)"
			(selected-item-changed)="onFromToChange($event)"
			required
			aria-required="true">
    	</vaadin-combo-box>
		<!-- Date/time selector: prefer native datetime picker on mobile, when available...  -->
		<paper-input id="datetime"
			*ngIf="Modernizr.inputtypes['datetime-local'] && device.isMobile()"
			type="datetime-local"
			label="Date and time"
			[(value)]="datetime"
			aria-required="true">
		</paper-input>
		<!-- ...use fallback in all other cases -->
		<div *ngIf="!Modernizr.inputtypes['datetime-local'] || !device.isMobile()">
			<vaadin-date-picker	id="date" label="Date" [(value)]="date" name="date" (mouseup)="onDateChange($event)"></vaadin-date-picker>
			<paper-input id="time" type="text" label="Time" [(ngModel)]="time" name="time" ngDefaultControl></paper-input>
			<!--md-input id="time" type="text" label="Time" placeholder="Time" [(ngModel)]="time" name="time"></md-input-->
		</div>
		<!-- 'Submit' -->
		<paper-button type="submit" raised [disabled]="!valid" (click)="onSearch()">
			<iron-icon icon="search"></iron-icon>
			Find journey
		</paper-button>
	</form>
</div>
<paper-toast id="journey-search-toast" text="Cannot access station list. Are you connected to the Internet?"></paper-toast>

`;