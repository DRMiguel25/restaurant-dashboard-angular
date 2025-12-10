import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="route-container" [@routeAnimator]="getRouteAnimationData(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  styles: [`
    .route-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
    }
  `],
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'frontend-app';

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || 'default';
  }
}
