import { SceneManager } from './SceneManager.js';

/**
 * TimelineUI - Creates an interactive timeline for scene navigation
 *
 * Provides a visual timeline at the bottom of the screen for navigating
 * through scenes chronologically or by index.
 */

export interface TimelineConfig {
  startYear?: number;
  endYear?: number;
  container?: string;
}

export class TimelineUI {
  private sceneManager: SceneManager;
  private container: HTMLElement;
  private timelineElement: HTMLElement;
  private currentIndex: number = -1;

  constructor(sceneManager: SceneManager, config: TimelineConfig = {}) {
    this.sceneManager = sceneManager;

    const {
      startYear = 2024,
      endYear = 2027,
      container = 'app'
    } = config;

    // Create timeline container
    this.container = document.getElementById(container) || document.body;
    this.timelineElement = this.createTimelineElement(startYear, endYear);
    this.container.appendChild(this.timelineElement);

    // Initialize timeline markers
    this.createTimelineMarkers();
  }

  /**
   * Creates the main timeline element
   */
  private createTimelineElement(startYear: number, endYear: number): HTMLElement {
    const timeline = document.createElement('div');
    timeline.id = 'timeline';
    timeline.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
      backdrop-filter: blur(10px);
      padding: 15px 40px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    `;

    // Create timeline track
    const track = document.createElement('div');
    track.id = 'timeline-track';
    track.style.cssText = `
      position: relative;
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      cursor: pointer;
      max-width: 1200px;
    `;

    // Create year labels
    const yearRange = endYear - startYear + 1;
    for (let i = 0; i <= yearRange; i++) {
      const year = startYear + i;
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        left: ${(i / yearRange) * 100}%;
        top: 15px;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.6);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.5px;
      `;
      label.textContent = year.toString();
      track.appendChild(label);
    }

    // Create progress indicator
    const progress = document.createElement('div');
    progress.id = 'timeline-progress';
    progress.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #2196F3);
      border-radius: 2px;
      width: 0%;
      transition: width 0.3s ease;
    `;
    track.appendChild(progress);

    timeline.appendChild(track);

    // Add click handler for timeline scrubbing
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const sceneCount = this.sceneManager.getSceneCount();
      const index = Math.floor(percent * sceneCount);
      this.loadSceneAtIndex(Math.max(0, Math.min(index, sceneCount - 1)));
    });

    return timeline;
  }

  /**
   * Creates interactive markers for each scene on the timeline
   */
  private createTimelineMarkers(): void {
    const track = document.getElementById('timeline-track');
    if (!track) return;

    const scenes = this.sceneManager.getAllScenes();
    const sceneCount = scenes.length;

    scenes.forEach((scene, index) => {
      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      marker.style.cssText = `
        position: absolute;
        left: ${(index / sceneCount) * 100}%;
        top: -4px;
        width: 12px;
        height: 12px;
        background: #fff;
        border: 2px solid rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        transform: translateX(-50%);
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 10;
      `;

      marker.title = scene.title;

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translateX(-50%) scale(1.3)';
        marker.style.background = '#4CAF50';
      });

      marker.addEventListener('mouseleave', () => {
        if (this.currentIndex !== index) {
          marker.style.transform = 'translateX(-50%) scale(1)';
          marker.style.background = '#fff';
        }
      });

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadSceneAtIndex(index);
      });

      track.appendChild(marker);
    });
  }

  /**
   * Loads a scene and updates timeline UI
   */
  private async loadSceneAtIndex(index: number): Promise<void> {
    try {
      await this.sceneManager.loadSceneByIndex(index);
      this.updateTimelinePosition(index);
    } catch (error) {
      console.error('Failed to load scene from timeline:', error);
    }
  }

  /**
   * Updates the timeline progress indicator
   */
  public updateTimelinePosition(index: number): void {
    this.currentIndex = index;
    const sceneCount = this.sceneManager.getSceneCount();
    const percent = ((index + 0.5) / sceneCount) * 100;

    const progress = document.getElementById('timeline-progress');
    if (progress) {
      progress.style.width = `${percent}%`;
    }

    // Update marker styles
    const markers = document.querySelectorAll('.timeline-marker');
    markers.forEach((marker, i) => {
      const el = marker as HTMLElement;
      if (i === index) {
        el.style.background = '#4CAF50';
        el.style.transform = 'translateX(-50%) scale(1.3)';
      } else {
        el.style.background = '#fff';
        el.style.transform = 'translateX(-50%) scale(1)';
      }
    });
  }

  /**
   * Cleanup and remove timeline
   */
  public dispose(): void {
    if (this.timelineElement && this.timelineElement.parentNode) {
      this.timelineElement.parentNode.removeChild(this.timelineElement);
    }
  }
}
