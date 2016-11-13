// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `
<div *ngIf="!error">
	<div *ngIf="!ready"><!-- Progress indicator -->
		<progress-indicator label="Getting ready..."></progress-indicator>
	</div>
	<div *ngIf="ready">
		<div *ngIf="!searchComplete"><!-- Search form or progress indicator -->
			<div *ngIf="!searchInProgress"><!-- Search form -->
				<!-- Form -->
					<vaadin-combo-box
						id="stop"
						label="Station/stop"
						[items]="stopSuggestionsJSON"
						item-label-path="_name"
						item-value-path="_apiId"
						[(value)]="stopId"
						name="stop"
						(keyup)="onStopKeyUp($event)"
						(selected-item-changed)="onStopChange($event)"
						required
						aria-required="true"
					>
					</vaadin-combo-box>
					<paper-button type="submit" raised [disabled]="!valid" (click)="onSearch()">
						<iron-icon icon="search"></iron-icon>
						Find departures
					</paper-button>
				<!-- transit map (required by Udacity) -->
					<div class="api-map" [hidden]="searchInProgress || searchComplete">
						<img class="api-map" src="images/api-rejseplanen-map.png"/>
						</div>
					</div>
			<div *ngIf="searchInProgress"><!-- Progress indicator -->
				<progress-indicator label="Searching depatures..."></progress-indicator>
			</div>
		</div>
	</div>
	<div *ngIf="searchComplete"><!-- Departures search results list w/header -->
		<div class="list-header">
			<div>
				<iron-icon icon="maps:directions-transit"></iron-icon>
				&nbsp;
				{{stop ? stop.name() : ''}}
			</div>
			<div>
				<iron-icon icon="icons:date-range"></iron-icon>
				&nbsp;
				{{getDate()}}
				&nbsp;
				<a href="" (click)="onChangeSearch()">Change</a>
			</div>
		</div>
		<div class="md-list-wrapper">
			<md-list *ngFor="let trip of departures">
				<div class="md-list" (click)="onDepartureSelected(trip)">
					<md-list-item>
						<img
							src="{{trip.route() && trip.route().iconUrl() ? trip.route().iconUrl() : ''}}"
							alt="{{trip.route() && trip.route().iconAltText() ? trip.route().iconAltText() : ''}}"
							class="route-icon"/>
						<div class=md-list-item-text>
							{{getDepartureTime(trip)}}
							({{trip.stopTimes()[trip.stopTimes().length - 1] && trip.stopTimes()[trip.stopTimes().length - 1].stop() ? trip.stopTimes()[trip.stopTimes().length - 1].stop().name() : ''}})
						</div>
					</md-list-item>
				</div>
			</md-list>
			<div class="nomatch" *ngIf="!departures.length">
				<p>Nothing matched your search.</p>
				<p>Please try again.</p>
			</div>
		</div>
	</div>
</div>
<div *ngIf="error">
	<error-message *ngIf="error" (onErrorOK)="onErrorOK($event)"></error-message>
</div>
`;