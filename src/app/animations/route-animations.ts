import {
    trigger,
    transition,
    style,
    query,
    animate,
    group
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimator', [
    transition('* <=> *', [
        // Set initial states
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            })
        ], { optional: true }),

        // Animate both entering and leaving
        group([
            // Leaving element: fade out + slide left
            query(':leave', [
                animate('300ms ease-out', style({
                    opacity: 0,
                    transform: 'translateX(-30px)'
                }))
            ], { optional: true }),

            // Entering element: fade in + slide from right
            query(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateX(30px)'
                }),
                animate('300ms ease-out', style({
                    opacity: 1,
                    transform: 'translateX(0)'
                }))
            ], { optional: true })
        ])
    ])
]);
