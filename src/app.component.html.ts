// write template as ts string literal so it will be included in compiled bundle; else external html may cause extra http request
// source: http://blog.angular-university.io/how-to-run-angular-2-in-production-today/

export const htmlTemplate = `

<paper-drawer-panel force-narrow>
	<paper-header-panel drawer>
		<div class="drawer-item" ><iron-icon icon="maps:directions-transit"></iron-icon>Public Transit App</div>
		<div class="drawer-item" paper-drawer-toggle><a routerLink="/planner" routerLinkActive="active" paper-drawer-toggle>Journey Planner</a></div>
		<div class="drawer-item"><a routerLink="/arrivals" routerLinkActive="active" paper-drawer-toggle>Arrivals</a></div>
		<div class="drawer-item"><a routerLink="/departures" routerLinkActive="active" paper-drawer-toggle>Departures</a></div>
		<div class="drawer-item"><a routerLink="/about" routerLinkActive="active" paper-drawer-toggle>About</a></div>
	</paper-header-panel>
	<paper-header-panel main>
		<paper-toolbar [class.raised]="isInChildView">
			<paper-icon-button icon="menu" *ngIf="!isInChildView" paper-drawer-toggle></paper-icon-button>
			<paper-icon-button icon="arrow-back" *ngIf="isInChildView" (click)="goBack()"></paper-icon-button>
			<div main-title>{{title}}</div>
			<span style="flex: 1;"></span>
			<div style="text-align:right;"><img src="images/logo-inverse.png" height="36px" width="36px"/></div>
		</paper-toolbar>
		<router-outlet></router-outlet>
	</paper-header-panel>
</paper-drawer-panel>
<paper-toast id="cacheworker-update-toast" text="Update available">
	<paper-button (click)="update()">Install</paper-button>
	<paper-button (click)="closeToast()">Dismiss</paper-button>
</paper-toast>

`;