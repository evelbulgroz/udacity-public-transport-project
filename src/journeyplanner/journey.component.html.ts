// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `
<!-- DEPRECATED? 
	Known bug: Journey list and search state bindings don't work in Firefox,
	causing search display to not autoupdate when data has been retrieved (trigger requires manual interaction).
	Asssuming this is an Angular2 bug => no action except to wait for it to be fixed in a future release.
	-->
<div *ngIf="!error">
	<div *ngIf="!ready">
		<progress-indicator label="Getting ready..."></progress-indicator>
	</div>
	<div *ngIf="ready">
		<div *ngIf="!searchComplete"><!-- Search form or progress indicator -->
			<div *ngIf="!searchInProgress">
				<!-- Search form -->
					<journey-search
						(onFindJourney)="onFindJourney($event)"
						[origin]="origin"
						[destination]="destination"
						[date]="date">
					</journey-search>
				<!-- transit map (required by Udacity) -->
					<div class="api-map" [hidden]="searchInProgress || searchComplete">
						<img class="api-map" src="images/api-rejseplanen-map.png"/>
						</div>
					</div>
			<div *ngIf="searchInProgress"><!-- Progress indicator -->
				<progress-indicator label="Searching journeys..."></progress-indicator>
			</div>
		</div>
		<div *ngIf="searchComplete"><!-- Journey search results list w/header -->
			<div class="list-header">
				<div>
					<iron-icon icon="maps:directions-transit"></iron-icon>
					&nbsp;
					{{origin ? origin.name() : ''}}
					<iron-icon icon="icons:arrow-forward"></iron-icon>
					{{destination ? destination.name() : ''}}
				</div>
				<div>
					<iron-icon icon="icons:date-range"></iron-icon>
					&nbsp;
					{{getDate()}}
					&nbsp;
					<a href="" (click)="onChangeSearch()">Change</a>
				</div>
			</div>
			<div  *ngIf="journeys.length" id="journey-list" class="md-list-wrapper">
				<md-list *ngFor="let journey of journeys">
					<div class="md-list" (click)="onJourneySelected(journey)">
						<md-list-item>
							<div *ngFor="let leg of journey.legs()">
								<img
									src="{{leg.trip().iconUrl() || leg.trip().route().iconUrl()}}"
									alt="{{leg.trip().iconAltText() || leg.trip().name() || leg.trip().route().iconAltText()}}"
									class="route-icon"
								/>
							</div>
							<div class=md-list-item-text>
								{{getDepartureTime(journey) + '-' + getArrivalTime(journey)}}
								({{getDuration(journey)}},&nbsp;{{getChanges(journey).replace(' ', '&nbsp;')}})
							</div>
						</md-list-item>
					</div>
				</md-list>
				<div class="add-to-list-link"><a (click)="addLaterJourneys();">Find later journeys</a></div>
			</div>
			<div class="nomatch" *ngIf="!journeys.length">
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