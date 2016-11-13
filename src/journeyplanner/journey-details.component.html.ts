// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `

<!-- Journey details list w/header -->
<div *ngIf="journey">
	<div class="list-header">
		<div>
			<iron-icon icon="maps:directions-transit"></iron-icon>
			&nbsp;
			{{origin.stop() ? origin.stop().name() : ''}}
			<iron-icon icon="icons:arrow-forward"></iron-icon>
			{{destination.stop() ? destination.stop().name() : ''}}
		</div>
		<div>
			<iron-icon icon="icons:date-range"></iron-icon>
			&nbsp;
			{{getDate(journey)}}
			&nbsp;
		</div>
	</div>
	<div id="journey-details-list" class="md-list-wrapper">
		<md-list *ngFor="let leg of journey.legs()">
			<div class="md-list" (click)="onLegSelected(leg)">
				<md-list-item>
					<img
						src="{{leg.trip().iconUrl() || leg.trip().route().iconUrl()}}"
						alt="{{leg.trip().iconAltText() || leg.trip().name() || leg.trip().route().iconAltText()}}"
						class="route-icon"
					/>
					<div class=md-list-item-text>
						{{getDepartureTime(leg)}}
						 {{leg.origin().stop().name()}}
						<span *ngIf="leg.origin().trip().route().type() !== 8"><!-- not walking leg-->
							({{(getPlatform(leg) !== '' ? getPlatform(leg) + ', ' : '') + getDuration(leg)}})
						</span>
						<span *ngIf="leg.origin().trip().route().type() === 8"><!-- walking leg-->
							({{getDuration(leg)}})
						</span>
						
					</div>
				</md-list-item>
			</div>
		</md-list>
	</div>
</div>

`;