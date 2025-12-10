import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfettiService {
    private colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#ffd93d', '#c084fc', '#f472b6'];

    launch(): void {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
        document.body.appendChild(container);

        // Create 100 confetti particles
        for (let i = 0; i < 100; i++) {
            this.createParticle(container, i);
        }

        // Remove container after animation
        setTimeout(() => {
            container.remove();
        }, 4000);
    }

    private createParticle(container: HTMLElement, index: number): void {
        const particle = document.createElement('div');
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const startX = Math.random() * 100;
        const delay = Math.random() * 500;
        const duration = 2000 + Math.random() * 1000;
        const size = 8 + Math.random() * 8;
        const rotation = Math.random() * 720 - 360;

        particle.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      opacity: 1;
      animation: confetti-fall ${duration}ms ease-out ${delay}ms forwards;
      transform: rotate(0deg);
    `;

        // Add keyframes if not already added
        if (!document.getElementById('confetti-keyframes')) {
            const style = document.createElement('style');
            style.id = 'confetti-keyframes';
            style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(${rotation}deg);
            opacity: 0;
          }
        }
      `;
            document.head.appendChild(style);
        }

        container.appendChild(particle);
    }
}
